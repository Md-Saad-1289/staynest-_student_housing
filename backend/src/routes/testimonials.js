import express from 'express';
import {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleApproval,
  toggleFeatured,
} from '../controllers/testimonialController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/', getTestimonials);

// Admin routes - must come before /:id routes
router.get('/admin/all', auth, authorize('admin'), getAllTestimonials);
router.post('/', auth, authorize('admin'), createTestimonial);
router.put('/:id/approve', auth, authorize('admin'), toggleApproval);
router.put('/:id/feature', auth, authorize('admin'), toggleFeatured);
router.put('/:id', auth, authorize('admin'), updateTestimonial);
router.delete('/:id', auth, authorize('admin'), deleteTestimonial);

export default router;
