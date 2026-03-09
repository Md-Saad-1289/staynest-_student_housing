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

// Admin routes - must come before public routes (more specific)
router.get('/admin/all', auth, authorize('admin'), getAllTestimonials);
router.post('/', auth, authorize('admin'), createTestimonial);
router.put('/:id/approve', auth, authorize('admin'), toggleApproval);
router.put('/:id/feature', auth, authorize('admin'), toggleFeatured);
router.put('/:id', auth, authorize('admin'), updateTestimonial);
router.delete('/:id', auth, authorize('admin'), deleteTestimonial);

// Public route - comes last
router.get('/', getTestimonials);

export default router;
