import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';

const router = Router();

router.get('/weekly-digest', AnalyticsController.getWeeklyDigest);
router.get('/evaluation', AnalyticsController.runEvaluation);
router.get('/clusters', AnalyticsController.getClusters);
router.post('/clusters/manage', AnalyticsController.manageCluster);
router.get('/audit-logs', AnalyticsController.getAuditLogs);
router.get('/export/:format', AnalyticsController.exportData);

export default router;
