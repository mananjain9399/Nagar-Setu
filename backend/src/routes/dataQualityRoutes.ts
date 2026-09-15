import { Router } from 'express';
import { DataQualityController } from '../controllers/dataQualityController';

const router = Router();

router.get('/stats', DataQualityController.getQualityStats);
router.get('/issues', DataQualityController.getQualityIssues);

export default router;
