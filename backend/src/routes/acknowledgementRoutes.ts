import { Router } from 'express';
import { AcknowledgementController } from '../controllers/acknowledgementController';

const router = Router();

router.post('/draft', AcknowledgementController.generateDraft);
router.post('/:id/approve', AcknowledgementController.approveDraft);
router.post('/:id/reject', AcknowledgementController.rejectDraft);

export default router;
