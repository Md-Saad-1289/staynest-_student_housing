import mongoose from 'mongoose';
import Listing from '../models/Listing.js';
import Review from '../models/Review.js';
import User from '../models/User.js';

// Get all listings with filters
const getListings = async (req, res) => {
  try {
    const { city, minRent, maxRent, genderAllowed, type, page = 1, limit = 10 } = req.query;

    const filter = { verified: true };

    if (city) filter.city = city;
    if (genderAllowed) filter.genderAllowed = genderAllowed;
    if (type) filter.type = type;

    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = parseInt(minRent);
      if (maxRent) filter.rent.$lte = parseInt(maxRent);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const listings = await Listing.find(filter)
      .populate('ownerId', 'name email mobile')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

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

// Get single listing
const getListing = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid listing id' });
    const listing = await Listing.findById(req.params.id).populate('ownerId', 'name email mobile isVerified');
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Increment view count
    listing.views = (listing.views || 0) + 1;
    await listing.save();

    const reviews = await Review.find({ listingId: listing._id }).populate('studentId', 'name');

    res.json({
      listing,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create listing (owner only)
const createListing = async (req, res) => {
  try {
    const { title, address, city, type, rent, deposit, genderAllowed, meals, facilities, rules, photos } = req.body;

    if (!title || !address || !city || !type || !rent || !deposit || !genderAllowed) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const listing = new Listing({
      ownerId: req.user.userId,
      title,
      address,
      city,
      type,
      rent: parseInt(rent),
      deposit: parseInt(deposit),
      genderAllowed,
      meals: meals || {},
      facilities: facilities || {},
      rules,
      photos: photos || [],
      verified: false,
    });

    await listing.save();

    res.status(201).json({
      message: 'Listing created successfully',
      listing,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update listing (owner only)
const updateListing = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid listing id' });
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.ownerId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    // Prevent updating verified status directly via API
    const { verified, ...updateData } = req.body;
    
    Object.assign(listing, updateData);
    await listing.save();

    res.json({
      message: 'Listing updated successfully',
      listing,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get owner's listings
const getOwnerListings = async (req, res) => {
  try {
    const listings = await Listing.find({ ownerId: req.user.userId });
    res.json({ listings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle favorite listing
const toggleFavoriteListing = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { listingId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isFavorited = user.favorites.includes(listingId);

    if (isFavorited) {
      user.favorites = user.favorites.filter((id) => id.toString() !== listingId);
    } else {
      user.favorites.push(listingId);
    }

    await user.save();
    res.json({ message: isFavorited ? 'Removed from favorites' : 'Added to favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's favorite listings
const getUserFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('favorites');
    res.json({ favorites: user?.favorites || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add listing view to history
const addViewHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { listingId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Remove if already exists
    user.viewHistory = user.viewHistory.filter((v) => v.listingId.toString() !== listingId);

    // Add to front
    user.viewHistory.unshift({ listingId, viewedAt: new Date() });

    // Keep only last 20
    if (user.viewHistory.length > 20) {
      user.viewHistory = user.viewHistory.slice(0, 20);
    }

    await user.save();
    res.json({ message: 'View history updated', viewHistory: user.viewHistory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's view history
const getViewHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('viewHistory.listingId');
    res.json({ viewHistory: user?.viewHistory || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get featured listings (public endpoint)
const getFeaturedListingsPublic = async (req, res) => {
  try {
    const listings = await Listing.find({ isFeatured: true, verified: true })
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ listings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete listing (owner can delete own listing, admin can delete any)
const deleteListing = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid listing id' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check authorization: owner can delete own, admin can delete any
    const isOwner = listing.ownerId.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    // Delete the listing
    await Listing.findByIdAndDelete(req.params.id);

    // Also delete associated reviews
    await Review.deleteMany({ listingId: req.params.id });

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Single export statement - each function exported exactly once
export {
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
  deleteListing,
};
