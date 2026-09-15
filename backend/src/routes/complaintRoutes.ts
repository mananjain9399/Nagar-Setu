import { Router } from 'express';
import { ComplaintController } from '../controllers/complaintController';

const router = Router();

router.get('/', ComplaintController.listComplaints);
router.get('/:id', ComplaintController.getComplaintById);
router.patch('/:id', ComplaintController.updateComplaint);
router.patch('/acknowledgement/:draftId', ComplaintController.updateAcknowledgementDraft);

export default router;
