import { Router } from 'express';
import { LocalityController } from '../controllers/localityController';

const router = Router();

router.post('/normalize', LocalityController.normalizeLocation);
router.post('/normalise', LocalityController.normalizeLocation);
router.get('/lookup', LocalityController.lookup);

export default router;
