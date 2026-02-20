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

// Admin routes
router.use(auth, authorize('admin'));
router.get('/admin/all', getAllTestimonials);
router.post('/', createTestimonial);
router.put('/:id', updateTestimonial);
router.delete('/:id', deleteTestimonial);
router.put('/:id/approve', toggleApproval);
router.put('/:id/feature', toggleFeatured);

export default router;
