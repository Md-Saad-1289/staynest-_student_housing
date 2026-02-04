import express from 'express';
import {
  getSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
} from '../controllers/savedSearchController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getSavedSearches);
router.post('/', auth, createSavedSearch);
router.put('/:id', auth, updateSavedSearch);
router.delete('/:id', auth, deleteSavedSearch);

export default router;
