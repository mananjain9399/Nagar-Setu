import axios from 'axios';
import {
  Complaint,
  PaginatedComplaints,
  ComplaintFilterQuery,
  DashboardStats,
  Department,
  Ward,
  Locality,
  AliasOverlap,
  NormalisationResult,
  DataQualitySummary,
  DataQualityIssue,
  ImportResult,
  ReviewDecision,
} from '../types';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // 1. Dashboard stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await client.get('/dashboard/stats');
    return res.data.data;
  },

  // 2. Complaints queue with filters
  getComplaints: async (filters: ComplaintFilterQuery = {}): Promise<PaginatedComplaints> => {
    const res = await client.get('/complaints', { params: filters });
    return res.data.data;
  },

  // 3. Complaint detail by ID
  getComplaintById: async (id: string): Promise<Complaint> => {
    const res = await client.get(`/complaints/${id}`);
    return res.data.data;
  },

  // 4. Submit operator review
  submitReview: async (
    complaintId: string,
    reviewData: {
      reviewedBy: string;
      decision: ReviewDecision;
      comments?: string;
      modifiedFields?: {
        department?: string;
        category?: string;
        urgency?: string;
        ward?: string;
        locality?: string;
      };
    }
  ): Promise<{ review: any; complaint: Complaint }> => {
    const res = await client.post(`/complaints/${complaintId}/review`, reviewData);
    return res.data.data;
  },

  updateAcknowledgementDraft: async (
    draftId: string,
    data: { draftedText?: string; status?: string; editedBy?: string }
  ): Promise<any> => {
    const res = await client.patch(`/complaints/acknowledgement/${draftId}`, data);
    return res.data.data;
  },

  // 5. Taxonomy & Departments
  getDepartments: async (): Promise<Department[]> => {
    const res = await client.get('/departments');
    return res.data.data;
  },

  getTaxonomy: async (): Promise<Department[]> => {
    const res = await client.get('/taxonomy');
    return res.data.data;
  },

  importTaxonomyJSON: async (records: any[]): Promise<any> => {
    const res = await client.post('/taxonomy/import', { records });
    return res.data.data;
  },

  importTaxonomyCSV: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/taxonomy/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  importTaxonomyCSVText: async (csvData: string): Promise<any> => {
    const res = await client.post('/taxonomy/import', { csvData });
    return res.data.data;
  },

  validateTaxonomyJSON: async (records: any[]): Promise<any> => {
    const res = await client.post('/taxonomy/validate', { records });
    return res.data.data;
  },

  validateTaxonomyCSVText: async (csvData: string): Promise<any> => {
    const res = await client.post('/taxonomy/validate', { csvData });
    return res.data.data;
  },

  // 6. Gazetteer Management
  getWards: async (): Promise<Ward[]> => {
    const res = await client.get('/gazetteer/wards');
    return res.data.data;
  },

  getLocalities: async (): Promise<Locality[]> => {
    const res = await client.get('/gazetteer/localities');
    return res.data.data;
  },

  getGazetteerOverlaps: async (): Promise<AliasOverlap[]> => {
    const res = await client.get('/gazetteer/overlaps');
    return res.data.data;
  },

  importGazetteerJSON: async (records: any[]): Promise<any> => {
    const res = await client.post('/gazetteer/import', { records });
    return res.data.data;
  },

  importGazetteerCSV: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/gazetteer/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  importGazetteerCSVText: async (csvData: string): Promise<any> => {
    const res = await client.post('/gazetteer/import', { csvData });
    return res.data.data;
  },

  getLocations: async (): Promise<{ wards: string[]; localities: string[] }> => {
    const res = await client.get('/locations');
    return res.data.data;
  },

  // 7. Locality Normalisation Service
  normalizeLocation: async (location: string): Promise<NormalisationResult> => {
    const res = await client.post('/locality/normalize', { location });
    return res.data.data;
  },

  // 8. Data Quality Service
  getDataQualityStats: async (): Promise<DataQualitySummary> => {
    const res = await client.get('/data-quality/stats');
    return res.data.data;
  },

  getDataQualityIssues: async (): Promise<DataQualityIssue[]> => {
    const res = await client.get('/data-quality/issues');
    return res.data.data;
  },

  // 9. Data Import (Phase 1)
  importJSON: async (records: any[]): Promise<ImportResult> => {
    const res = await client.post('/import/json', { records });
    return res.data.data;
  },

  importCSVFile: async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  importCSVText: async (csvData: string): Promise<ImportResult> => {
    const res = await client.post('/import/csv', { csvData });
    return res.data.data;
  },

  importSampleDataset: async (): Promise<ImportResult> => {
    const res = await client.post('/import/sample');
    return res.data.data;
  },

  // 10. AI Processing Engine (Phase 3)
  getAIStatus: async (): Promise<any> => {
    const res = await client.get('/ai/status');
    return res.data.data;
  },

  processComplaintWithAI: async (complaintId: string): Promise<any> => {
    const res = await client.post(`/ai/process/${complaintId}`);
    return res.data.data;
  },

  analyzeRawTextWithAI: async (payload: { rawText: string; mediaType?: string; caption?: string }): Promise<any> => {
    const res = await client.post('/ai/analyze', payload);
    return res.data.data;
  },

  batchProcessAI: async (limit: number = 25): Promise<any> => {
    const res = await client.post(`/ai/batch-process?limit=${limit}`);
    return res.data.data;
  },

  // 11. Analytics, Weekly Digest & Evaluation (Phase 5)
  getWeeklyDigest: async (): Promise<any> => {
    const res = await client.get('/analytics/weekly-digest');
    return res.data.data;
  },

  getEvaluationBenchmark: async (): Promise<any> => {
    const res = await client.get('/analytics/evaluation');
    return res.data.data;
  },

  getClusters: async (): Promise<any> => {
    const res = await client.get('/analytics/clusters');
    return res.data.data;
  },

  manageCluster: async (data: any): Promise<any> => {
    const res = await client.post('/analytics/clusters/manage', data);
    return res.data.data;
  },

  getAuditLogs: async (complaintId?: string): Promise<any> => {
    const res = await client.get('/analytics/audit-logs', { params: { complaintId } });
    return res.data.data;
  },

  // 12. Acknowledgement Draft Lifecycle (Phase 4)
  generateAcknowledgementDraft: async (data: { complaintId: string; channel?: string; language?: string }): Promise<any> => {
    const res = await client.post('/acknowledgement/draft', data);
    return res.data.data;
  },

  approveAcknowledgementDraft: async (id: string, data: { reviewedBy: string; revisedText?: string }): Promise<any> => {
    const res = await client.post(`/acknowledgement/${id}/approve`, data);
    return res.data.data;
  },

  rejectAcknowledgementDraft: async (id: string, data: { reviewedBy: string; reason?: string }): Promise<any> => {
    const res = await client.post(`/acknowledgement/${id}/reject`, data);
    return res.data.data;
  },
};

export default api;
