import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';

const router = Router();

router.post('/:id/review', ReviewController.submitReview);
router.get('/:id/reviews', ReviewController.getReviews);

export default router;
