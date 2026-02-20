import mongoose from 'mongoose';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Flag from '../models/Flag.js';
import AuditLog from '../models/AuditLog.js';

// Verify owner
const verifyOwner = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) return res.status(400).json({ error: 'Invalid user id' });
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isVerified = true;
    user.verifiedBy = req.user.userId || null;
    user.verifiedAt = new Date();
    // clear any previous rejection info
    user.rejectionReason = null;
    user.rejectedBy = null;
    user.rejectedAt = null;
    await user.save();

    await AuditLog.create({
      adminId: req.user.userId,
      action: 'verify_owner',
      targetType: 'user',
      targetId: user._id,
      reason: '',
      meta: { email: user.email },
    });

    res.json({
      message: 'Owner verified successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject owner with reason
const rejectOwner = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) return res.status(400).json({ error: 'Invalid user id' });
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isVerified = false;
    user.rejectionReason = reason || 'Rejected by admin';
    user.rejectedBy = req.user.userId || null;
    user.rejectedAt = new Date();
    await user.save();

    await AuditLog.create({
      adminId: req.user.userId,
      action: 'reject_owner',
      targetType: 'user',
      targetId: user._id,
      reason: user.rejectionReason,
      meta: { email: user.email },
    });

    res.json({ message: 'Owner rejected', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify listing
const verifyListing = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid listing id' });
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    listing.verified = true;
    
    // Add 'verified' badge only if not already present
    if (!listing.badges.includes('verified')) {
      listing.badges.push('verified');
    }
    
    await listing.save();

    await AuditLog.create({
      adminId: req.user.userId,
      action: 'verify_listing',
      targetType: 'listing',
      targetId: listing._id,
      reason: '',
      meta: { title: listing.title },
    });

    res.json({
      message: 'Listing verified successfully',
      listing,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalListings = await Listing.countDocuments();
    const verifiedListings = await Listing.countDocuments({ verified: true });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const totalReviews = await Review.countDocuments();
    const unresolvedFlags = await Flag.countDocuments({ resolved: false });

    res.json({
      stats: {
        users: {
          total: totalUsers,
          owners: totalOwners,
          students: totalStudents,
        },
        listings: {
          total: totalListings,
          verified: verifiedListings,
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
        },
        reviews: totalReviews,
        unresolvedFlags,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get unverified owners
const getUnverifiedOwners = async (req, res) => {
  try {
    const owners = await User.find({ role: 'owner', isVerified: false });
    res.json({ owners });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get unverified listings
const getUnverifiedListings = async (req, res) => {
  try {
    const listings = await Listing.find({ verified: false }).populate('ownerId', 'name email isVerified');
    res.json({ listings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get flags
const getFlags = async (req, res) => {
  try {
    const flags = await Flag.find()
      .populate('listingId')
      .populate('flaggedBy', 'name email')
      .sort({ resolved: 1, createdAt: -1 });

    res.json({ flags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Resolve flag
const resolveFlag = async (req, res) => {
  try {
    const { adminNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid flag id' });
    const flag = await Flag.findById(req.params.id);
    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    flag.resolved = true;
    flag.adminNotes = adminNotes || '';
    await flag.save();

    await AuditLog.create({
      adminId: req.user.userId,
      action: 'resolve_flag',
      targetType: 'flag',
      targetId: flag._id,
      reason: adminNotes || '',
      meta: { listingId: flag.listingId },
    });

    res.json({
      message: 'Flag resolved',
      flag,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get featured listings
const getFeaturedListings = async (req, res) => {
  try {
    const listings = await Listing.find({ isFeatured: true, verified: true })
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ listings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle featured status
const toggleFeaturedListing = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid listing id' });
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    listing.isFeatured = !listing.isFeatured;
    await listing.save();

    await AuditLog.create({
      adminId: req.user.userId,
      action: listing.isFeatured ? 'feature_listing' : 'unfeature_listing',
      targetType: 'listing',
      targetId: listing._id,
      reason: `Listing ${listing.isFeatured ? 'featured' : 'unfeatured'}`,
      meta: { title: listing.title },
    });

    res.json({
      message: `Listing ${listing.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      listing,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete listing (admin only)
const deleteAdminListing = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid listing id' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const { reason } = req.body;

    // Delete associated reviews and bookings
    await Review.deleteMany({ listingId: req.params.id });
    await Booking.deleteMany({ listingId: req.params.id });

    // Create audit log before deletion
    await AuditLog.create({
      adminId: req.user.userId,
      action: 'delete_listing',
      targetType: 'listing',
      targetId: listing._id,
      reason: reason || 'Deleted by admin',
      meta: { title: listing.title, ownerId: listing.ownerId },
    });

    // Delete the listing
    await Listing.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Listing deleted successfully',
      deletedId: req.params.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all listings for admin management
const getAllListingsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', verified } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }
    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    const listings = await Listing.find(filter)
      .populate('ownerId', 'name email isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Listing.countDocuments(filter);

    res.json({
      listings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recent admin actions (audit logs) with pagination and optional action filter
const getAdminActions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(5, parseInt(req.query.limit, 10) || 10));
    const actionFilter = req.query.action || null;

    const filter = {};
    if (actionFilter) filter.action = actionFilter;

    const total = await AuditLog.countDocuments(filter);

    const logs = await AuditLog.find(filter)
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ logs, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
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
};
