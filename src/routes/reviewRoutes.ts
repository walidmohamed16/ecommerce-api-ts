import { Router } from 'express';
import {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController';
import { createReviewValidation, updateReviewValidation } from '../validations/reviewValidation';
import validate from '../middlewares/validate';
import auth from '../middlewares/auth';

const router: Router = Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.use(auth);
router.post('/', validate(createReviewValidation), createReview);
router.get('/me', getMyReviews);
router.put('/:id', validate(updateReviewValidation), updateReview);
router.delete('/:id', deleteReview);

export default router;