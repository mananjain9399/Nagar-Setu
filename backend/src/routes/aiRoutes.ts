import { Router } from 'express';
import { AIController } from '../controllers/aiController';

const router = Router();

router.get('/status', AIController.getStatus);
router.post('/process/:id', AIController.processComplaint);
router.post('/analyze', AIController.processRawText);
router.post('/batch-process', AIController.batchProcess);

export default router;
