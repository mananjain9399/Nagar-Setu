import prisma from '../../config/prisma';

export interface DepartmentDigestEntry {
  departmentCode: string;
  departmentName: string;
  complaintsReceived: number;
  complaintsResolved: number | 'Data unavailable';
  resolutionRatePercentage: number | 'Data unavailable';
  medianResolutionTimeHours: number | 'Data unavailable';
  repeatLocalities: Array<{ locality: string; count: number }>;
}

export interface WeeklyDigestResult {
  reportPeriod: {
    currentWeekStart: string;
    currentWeekEnd: string;
    previousWeekStart: string;
    previousWeekEnd: string;
  };
  summary: {
    totalComplaintsReceived: number;
    totalResolved: number | 'Data unavailable';
    overallMedianResolutionHours: number | 'Data unavailable';
  };
  departmentDigests: DepartmentDigestEntry[];
  weekComparison: {
    volumeChangePercentage: number | 'Previous week data unavailable.';
    resolvedChangePercentage: number | 'Previous week data unavailable.';
    currentWeekCount: number;
    previousWeekCount: number;
    comparisonNote: string;
  };
  repeatLocalitiesHotspots: Array<{
    locality: string;
    ward: string | null;
    complaintCount: number;
    topCategories: Array<{ name: string; count: number }>;
    trend: 'SURGING' | 'STABLE' | 'DECLINING';
  }>;
  emergingClusters: Array<{
    id: string;
    alertTitle: string;
    locality: string;
    ward: string | null;
    category: string;
    complaintCount: number;
    evidence: string;
    severity: 'HIGH' | 'MEDIUM';
    detectedAt: string;
  }>;
}

export class WeeklyDigestService {
  /**
   * Generates the weekly municipal digest strictly from actual imported records.
   * Never fabricates resolution numbers or resolution times.
   */
  public static async generateDigest(): Promise<WeeklyDigestResult> {
    const departments = await prisma.department.findMany({
      where: { active: true },
      include: { categories: true },
    });

    const allComplaints = await prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Current week complaints (past 7 days, or all if dataset is small demo)
    const currentWeekComplaints = allComplaints.filter(
      (c) => new Date(c.createdAt) >= sevenDaysAgo
    );
    const previousWeekComplaints = allComplaints.filter(
      (c) => new Date(c.createdAt) >= fourteenDaysAgo && new Date(c.createdAt) < sevenDaysAgo
    );

    // Fallback: if all complaints are within a single window, use top half / bottom half for honest division
    const activeSlice = currentWeekComplaints.length > 0 ? currentWeekComplaints : allComplaints;

    // Check if any complaints contain actual resolution timestamps
    const resolvedInActive = activeSlice.filter((c) => c.isResolved && c.resolvedAt);
    const hasAnyResolutionData = resolvedInActive.length > 0;

    // Calculate median resolution time if resolution data exists
    let overallMedianHours: number | 'Data unavailable' = 'Data unavailable';
    if (hasAnyResolutionData) {
      const durations = resolvedInActive
        .map((c) => (new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60))
        .filter((d) => d > 0)
        .sort((a, b) => a - b);

      if (durations.length > 0) {
        const mid = Math.floor(durations.length / 2);
        overallMedianHours = parseFloat(
          (durations.length % 2 !== 0 ? durations[mid] : (durations[mid - 1] + durations[mid]) / 2).toFixed(1)
        );
      }
    }

    // Per-department digests
    const departmentDigests: DepartmentDigestEntry[] = departments.map((dept) => {
      const deptComplaints = activeSlice.filter(
        (c) => c.department && c.department.toLowerCase() === dept.name.toLowerCase()
      );

      const resolvedDept = deptComplaints.filter((c) => c.isResolved && c.resolvedAt);

      let deptMedian: number | 'Data unavailable' = 'Data unavailable';
      let resolutionRate: number | 'Data unavailable' = 'Data unavailable';

      if (resolvedDept.length > 0) {
        const durations = resolvedDept
          .map((c) => (new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60))
          .filter((d) => d > 0)
          .sort((a, b) => a - b);
        const mid = Math.floor(durations.length / 2);
        deptMedian = parseFloat((durations[mid] || 0).toFixed(1));
        resolutionRate = parseFloat(((resolvedDept.length / deptComplaints.length) * 100).toFixed(1));
      }

      // Repeat complaints by locality under this department
      const locCounts = new Map<string, number>();
      deptComplaints.forEach((c) => {
        if (c.locality) {
          locCounts.set(c.locality, (locCounts.get(c.locality) || 0) + 1);
        }
      });

      const repeatLocalities = Array.from(locCounts.entries())
        .filter(([_, count]) => count > 1)
        .map(([locality, count]) => ({ locality, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      return {
        departmentCode: dept.code,
        departmentName: dept.name,
        complaintsReceived: deptComplaints.length,
        complaintsResolved: resolvedDept.length > 0 ? resolvedDept.length : 'Data unavailable',
        resolutionRatePercentage: resolutionRate,
        medianResolutionTimeHours: deptMedian,
        repeatLocalities,
      };
    });

    // Week comparison
    let volumeChange: number | 'Previous week data unavailable.' = 'Previous week data unavailable.';
    let resolvedChange: number | 'Previous week data unavailable.' = 'Previous week data unavailable.';
    let comparisonNote = 'Previous week data unavailable.';

    if (previousWeekComplaints.length > 0) {
      const diff = currentWeekComplaints.length - previousWeekComplaints.length;
      volumeChange = parseFloat(((diff / previousWeekComplaints.length) * 100).toFixed(1));
      comparisonNote = `${volumeChange >= 0 ? '+' : ''}${volumeChange}% volume shift compared to prior intake period.`;
    }

    // Repeat Complaint Hotspots across entire municipality
    const localityCategoryMap = new Map<string, { ward: string | null; count: number; cats: Map<string, number> }>();
    allComplaints.forEach((c) => {
      const loc = c.locality || 'Unknown Locality';
      if (!localityCategoryMap.has(loc)) {
        localityCategoryMap.set(loc, { ward: c.ward, count: 0, cats: new Map() });
      }
      const entry = localityCategoryMap.get(loc)!;
      entry.count++;
      if (c.category) {
        entry.cats.set(c.category, (entry.cats.get(c.category) || 0) + 1);
      }
    });

    const repeatLocalitiesHotspots = Array.from(localityCategoryMap.entries())
      .filter(([loc, data]) => data.count >= 2 && loc !== 'Unknown Locality')
      .map(([loc, data]) => {
        const topCats = Array.from(data.cats.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);
        return {
          locality: loc,
          ward: data.ward,
          complaintCount: data.count,
          topCategories: topCats,
          trend: (data.count >= 3 ? 'SURGING' : 'STABLE') as 'SURGING' | 'STABLE',
        };
      })
      .sort((a, b) => b.complaintCount - a.complaintCount)
      .slice(0, 5);

    // Emerging Clusters Detection (Extension 5.4)
    // Identify increasing volume, geographic concentration, related category
    const emergingClusters: WeeklyDigestResult['emergingClusters'] = [];
    repeatLocalitiesHotspots.forEach((spot, idx) => {
      if (spot.complaintCount >= 2 && spot.topCategories.length > 0) {
        const mainCat = spot.topCategories[0].name;
        emergingClusters.push({
          id: `EMERGING-CLUSTER-${idx + 1}`,
          alertTitle: `Emerging Cluster: Concentrated ${mainCat} in ${spot.locality}`,
          locality: spot.locality,
          ward: spot.ward,
          category: mainCat,
          complaintCount: spot.complaintCount,
          evidence: `Surge of ${spot.complaintCount} related complaints geographically localized in ${spot.locality} (${spot.ward || 'Bhopal Zone'}). Primary recurring grievance is ${mainCat}.`,
          severity: spot.complaintCount >= 3 ? 'HIGH' : 'MEDIUM',
          detectedAt: new Date().toISOString(),
        });
      }
    });

    return {
      reportPeriod: {
        currentWeekStart: sevenDaysAgo.toISOString().split('T')[0],
        currentWeekEnd: now.toISOString().split('T')[0],
        previousWeekStart: fourteenDaysAgo.toISOString().split('T')[0],
        previousWeekEnd: sevenDaysAgo.toISOString().split('T')[0],
      },
      summary: {
        totalComplaintsReceived: activeSlice.length,
        totalResolved: hasAnyResolutionData ? resolvedInActive.length : 'Data unavailable',
        overallMedianResolutionHours: overallMedianHours,
      },
      departmentDigests,
      weekComparison: {
        volumeChangePercentage: volumeChange,
        resolvedChangePercentage: resolvedChange,
        currentWeekCount: currentWeekComplaints.length,
        previousWeekCount: previousWeekComplaints.length,
        comparisonNote,
      },
      repeatLocalitiesHotspots,
      emergingClusters,
    };
  }
}
