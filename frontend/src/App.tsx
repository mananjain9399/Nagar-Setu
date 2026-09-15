import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import {
  Complaint,
  DashboardStats,
  Department,
  ComplaintFilterQuery,
} from './types';
import { OperatorHeader, ActiveTabType } from './components/layout/OperatorHeader';
import { MetricGrid } from './components/dashboard/MetricGrid';
import { GreetingHero } from './components/dashboard/GreetingHero';
import { DepartmentDistribution } from './components/dashboard/DepartmentDistribution';
import { CategoryDistribution } from './components/dashboard/CategoryDistribution';
import { LocalityWardDistribution } from './components/dashboard/LocalityWardDistribution';
import { ChannelDistribution } from './components/dashboard/ChannelDistribution';
import { QueueFilterToolbar } from './components/queue/QueueFilterToolbar';
import { ComplaintQueueTable } from './components/queue/ComplaintQueueTable';
import { ComplaintDetailModal } from './components/detail/ComplaintDetailModal';
import { DatasetImportView } from './components/import/DatasetImportView';
import { TaxonomyManagementView } from './components/taxonomy/TaxonomyManagementView';
import { GazetteerManagementView } from './components/gazetteer/GazetteerManagementView';
import { DataQualityView } from './components/quality/DataQualityView';
import { AIPipelineView } from './components/ai/AIPipelineView';
import { WeeklyDigestView } from './components/digest/WeeklyDigestView';
import { EvaluationDashboardView } from './components/evaluation/EvaluationDashboardView';
import { BeforeAfterComparisonView } from './components/demo/BeforeAfterComparisonView';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('dashboard');

  // Dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [qualityScore, setQualityScore] = useState<number | undefined>(undefined);

  // Reference data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [localities, setLocalities] = useState<string[]>([]);

  // Queue state
  const [filters, setFilters] = useState<ComplaintFilterQuery>({
    page: 1,
    limit: 15,
  });
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setPages] = useState(1);
  const [loadingQueue, setLoadingQueue] = useState(true);

  // Selected complaint detail modal
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadQueue();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [statsData, deptData, locData, qualityData] = await Promise.all([
        api.getDashboardStats(),
        api.getDepartments(),
        api.getLocations(),
        api.getDataQualityStats().catch(() => null),
      ]);
      setStats(statsData);
      setDepartments(deptData);
      setWards(locData.wards);
      setLocalities(locData.localities);
      if (qualityData) {
        setQualityScore(qualityData.qualityScorePercentage);
      }
    } catch (err) {
      console.error('Error loading initial municipal data:', err);
    }
  };

  const loadQueue = async () => {
    setLoadingQueue(true);
    try {
      const data = await api.getComplaints(filters);
      setComplaints(data.items);
      setTotalCount(data.pagination.totalCount);
      setPages(data.pagination.totalPages);
    } catch (err) {
      console.error('Error loading complaint queue:', err);
    } finally {
      setLoadingQueue(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      api.getDashboardStats().then((s) => setStats(s)),
      api.getDataQualityStats().then((q) => setQualityScore(q.qualityScorePercentage)).catch(() => {}),
      loadQueue(),
    ]);
  };

  // Quick navigation into queue with filter preset
  const handleQuickFilter = (key: string, value: string) => {
    if (key === 'clear') {
      setFilters({ page: 1, limit: 15 });
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: 1,
      }));
    }
    setActiveTab('queue');
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-900 flex flex-col font-sans">
      {/* Top Operator Header with Navigation Tabs */}
      <OperatorHeader
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        pendingReviewCount={stats?.summary.requiresHumanReviewCount || 0}
        totalComplaints={stats?.summary.totalComplaints || 0}
        qualityScore={qualityScore}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* ================= VIEW 1: DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Top Command Center Hero Banner */}
            {stats && (
              <GreetingHero
                stats={stats.summary}
                qualityScore={qualityScore}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onScrollToAnalytics={() => {
                  const el = document.getElementById('operational-analytics');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* Operational Section */}
            <div id="operational-analytics" className="space-y-3 pt-1">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-heading">
                    ZONE OPERATIONAL OVERVIEW
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live grievance indicators and automated municipal triage metrics
                  </p>
                </div>
                <span className="text-[10px] font-mono font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  REAL-TIME STATS
                </span>
              </div>

              {/* Operational KPIs */}
              {stats && (
                <MetricGrid
                  stats={stats.summary}
                  onFilterClick={handleQuickFilter}
                />
              )}

              {/* Distribution Grids */}
              {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-1">
                  {/* 1. Complaints by Department */}
                  <DepartmentDistribution
                    data={stats.byDepartment}
                    total={stats.summary.totalComplaints}
                    onSelectDepartment={(dept) => handleQuickFilter('department', dept)}
                  />

                  {/* 2. Complaints by Category */}
                  <CategoryDistribution
                    data={stats.byCategory}
                    total={stats.summary.totalComplaints}
                    onSelectCategory={(cat) => handleQuickFilter('category', cat)}
                  />

                  {/* 3. Locality & Ward Density + Channels */}
                  <div className="space-y-3">
                    <LocalityWardDistribution
                      localities={stats.byLocality}
                      wards={stats.byWard}
                      onSelectLocality={(loc) => handleQuickFilter('locality', loc)}
                      onSelectWard={(w) => handleQuickFilter('ward', w)}
                    />
                    <ChannelDistribution
                      data={stats.bySourceChannel}
                      total={stats.summary.totalComplaints}
                      onSelectChannel={(ch) => handleQuickFilter('sourceChannel', ch)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= VIEW 2: COMPLAINT QUEUE ================= */}
        {activeTab === 'queue' && (
          <div className="space-y-3">
            {/* Multi-point Filter Toolbar */}
            <QueueFilterToolbar
              filters={filters}
              departments={departments}
              wards={wards}
              localities={localities}
              onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
              onResetFilters={() => setFilters({ page: 1, limit: 15 })}
              totalFiltered={totalCount}
            />

            {/* High-density Complaint Queue Table */}
            <ComplaintQueueTable
              complaints={complaints}
              totalCount={totalCount}
              currentPage={filters.page || 1}
              totalPages={totalPages}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              onSelectComplaint={(c) => setSelectedComplaintId(c.id)}
              loading={loadingQueue}
            />
          </div>
        )}

        {/* ================= VIEW 3: AI PIPELINE ENGINE ================= */}
        {activeTab === 'ai-pipeline' && (
          <AIPipelineView
            onInspectComplaint={(complaintId) => setSelectedComplaintId(complaintId)}
            onPipelineExecuted={() => refreshAll()}
          />
        )}

        {/* ================= VIEW 4: WEEKLY DIGEST & HOTSPOTS ================= */}
        {activeTab === 'digest' && (
          <WeeklyDigestView
            onInspectComplaint={(complaintId) => setSelectedComplaintId(complaintId)}
          />
        )}

        {/* ================= VIEW 5: EVALUATION BENCHMARK ================= */}
        {activeTab === 'evaluation' && <EvaluationDashboardView />}

        {/* ================= VIEW 6: BEFORE VS AFTER COMPARISON DEMO ================= */}
        {activeTab === 'comparison' && <BeforeAfterComparisonView />}

        {/* ================= VIEW 7: TAXONOMY MANAGEMENT ================= */}
        {activeTab === 'taxonomy' && <TaxonomyManagementView />}

        {/* ================= VIEW 8: GAZETTEER & NORMALISER ================= */}
        {activeTab === 'gazetteer' && <GazetteerManagementView />}

        {/* ================= VIEW 9: DATA QUALITY AUDIT ================= */}
        {activeTab === 'quality' && (
          <DataQualityView
            onInspectComplaint={(complaintId) => setSelectedComplaintId(complaintId)}
          />
        )}

        {/* ================= VIEW 10: DATASET INGESTION ================= */}
        {activeTab === 'import' && (
          <DatasetImportView
            onImportComplete={() => {
              refreshAll();
            }}
          />
        )}
      </main>

      {/* Complaint Detail & Operator Review Modal */}
      {selectedComplaintId && (
        <ComplaintDetailModal
          complaintId={selectedComplaintId}
          departments={departments}
          wards={wards}
          localities={localities}
          onClose={() => setSelectedComplaintId(null)}
          onReviewSubmitted={() => {
            refreshAll();
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-3 px-4 text-center mt-auto shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-bold text-slate-900">NAGAR SETU (नगर सेतु)</span>
            <span className="text-slate-500">• Bhopal Municipal Corporation • Zone Operations Console</span>
          </div>
          <p className="text-slate-400 font-mono text-[10px]">
            Enterprise Civic Grievance & Intelligence Bridge
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
