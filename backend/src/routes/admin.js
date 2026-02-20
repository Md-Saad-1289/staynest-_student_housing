import express from 'express';
import {
  verifyOwner,
  rejectOwner,
  verifyListing,
  getDashboardStats,
  getUnverifiedOwners,
  getUnverifiedListings,
  getFlags,
  resolveFlag,
  getFeaturedListings,
  toggleFeaturedListing,
  deleteAdminListing,
  getAllListingsForAdmin,
  getAdminActions,
} from '../controllers/adminController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(auth, authorize('admin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/owners/unverified', getUnverifiedOwners);
router.put('/owners/:userId/verify', verifyOwner);
router.put('/owners/:userId/reject', rejectOwner);
router.get('/listings/unverified', getUnverifiedListings);
router.get('/listings/all', getAllListingsForAdmin);
router.put('/listings/:id/verify', verifyListing);
router.get('/listings/featured', getFeaturedListings);
router.put('/listings/:id/toggle-featured', toggleFeaturedListing);
router.delete('/listings/:id', deleteAdminListing);
router.get('/flags', getFlags);
router.put('/flags/:id/resolve', resolveFlag);
router.get('/actions', getAdminActions);

export default router;
