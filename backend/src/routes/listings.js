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
  getFeaturedListingsPublic,
} from '../controllers/listingController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedListingsPublic);

// Specific routes MUST come before /:id route
router.get('/owner/my-listings', auth, authorize('owner'), getOwnerListings);
router.post('/user/toggle-favorite', auth, toggleFavoriteListing);
router.get('/user/favorites', auth, getUserFavorites);
router.post('/user/view-history', auth, addViewHistory);
router.get('/user/view-history', auth, getViewHistory);

// General routes
router.get('/', getListings);
router.post('/', auth, authorize('owner'), createListing);
router.get('/:id', getListing);
router.put('/:id', auth, authorize('owner'), updateListing);

export default router;
