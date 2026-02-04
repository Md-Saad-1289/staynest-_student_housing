import express from 'express';
import {
  createReview,
  getListingReviews,
  replyToReview,
} from '../controllers/reviewController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, authorize('student'), createReview);
router.get('/listing/:listingId', getListingReviews);
router.put('/:id/reply', auth, authorize('owner'), replyToReview);

export default router;
