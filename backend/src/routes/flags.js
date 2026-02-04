import express from 'express';
import { flagListing } from '../controllers/flagController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, authorize('student'), flagListing);

export default router;
