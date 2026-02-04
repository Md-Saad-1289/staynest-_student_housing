import express from 'express';
import {
  getListings,
  getListing,
  createListing,
  updateListing,
  getOwnerListings,
  toggleFavoriteListing,
  getUserFavorites,
  addViewHistory,
  getViewHistory,
} from '../controllers/listingController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getListings);
router.get('/:id', getListing);
router.post('/', auth, authorize('owner'), createListing);
router.put('/:id', auth, authorize('owner'), updateListing);
router.get('/owner/my-listings', auth, authorize('owner'), getOwnerListings);

// Favorites
router.post('/user/toggle-favorite', auth, toggleFavoriteListing);
router.get('/user/favorites', auth, getUserFavorites);

// View history
router.post('/user/view-history', auth, addViewHistory);
router.get('/user/view-history', auth, getViewHistory);

export default router;
