import mongoose from 'mongoose';
import Listing from '../models/Listing.js';
import Review from '../models/Review.js';
import User from '../models/User.js';

// Get all listings with filters
const getListings = async (req, res) => {
  try {
    const { city, minRent, maxRent, genderAllowed, type, page = 1, limit = 10 } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10)); // Max 50 results per page

    const filter = { verified: true };

    // Validate and add filters
    if (city && typeof city === 'string' && city.trim()) {
      filter.city = city.trim();
    }
    if (genderAllowed && ['male', 'female', 'both', 'any'].includes(genderAllowed)) {
      filter.genderAllowed = genderAllowed;
    }
    if (type && typeof type === 'string' && type.trim()) {
      filter.type = type.trim();
    }

    // Validate rent filters
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) {
        const min = parseInt(minRent);
        if (!isNaN(min) && min >= 0) {
          filter.rent.$gte = min;
        }
      }
      if (maxRent) {
        const max = parseInt(maxRent);
        if (!isNaN(max) && max >= 0) {
          filter.rent.$lte = max;
        }
      }
    }

    const skip = (pageNum - 1) * limitNum;
    const listings = await Listing.find(filter)
      .populate('ownerId', 'name email mobile phoneNo')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Listing.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      listings,
      pagination: {
        total,
        page: pageNum,
        pages: totalPages,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('getListings error:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
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
    const { title, description, location, landmarks, contact, rules, furnished, price, rooms, utilities, amenities, meals, photos } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
    }
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      return res.status(400).json({ error: 'Location is required and must be a non-empty string' });
    }
    if (!price || isNaN(price) || parseInt(price) <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    if (!contact || typeof contact !== 'string' || contact.trim().length === 0) {
      return res.status(400).json({ error: 'Contact information is required' });
    }

    // Validate optional fields
    if (description && typeof description !== 'string') {
      return res.status(400).json({ error: 'Description must be a string' });
    }

    // Normalize furnished value
    const furnishedMap = {
      'fully-furnished': 'fully',
      'fully': 'fully',
      'semi-furnished': 'semi',
      'semi': 'semi',
      'unfurnished': 'none',
      'none': 'none'
    };
    const normalizedFurnished = furnishedMap[furnished?.toLowerCase()] || 'semi';

    const priceNum = parseInt(price);
    const listing = new Listing({
      ownerId: req.user.userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      address: location.trim(),
      city: location.trim(),
      type: 'hostel',
      rent: priceNum,
      deposit: Math.round(priceNum * 0.5),
      furnished: normalizedFurnished,
      utilities: Array.isArray(utilities) ? utilities : [],
      meals: meals && typeof meals === 'object' ? meals : {},
      amenities: amenities && typeof amenities === 'object' ? amenities : {},
      rooms: Array.isArray(rooms) ? rooms : [],
      rules: rules ? rules.trim() : '',
      contact: contact.trim(),
      landmarks: landmarks ? landmarks.trim() : '',
      photos: Array.isArray(photos) ? photos : [],
      verified: false,
    });

    await listing.save();

    res.status(201).json({
      message: 'Listing created successfully',
      listing,
    });
  } catch (error) {
    console.error('createListing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
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
    
    // ensure rooms field is array if provided
    if (updateData.rooms && !Array.isArray(updateData.rooms)) {
      updateData.rooms = [];
    }

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

    // Ensure arrays exist
    if (!Array.isArray(user.favorites)) user.favorites = [];

    const listingIdStr = String(listingId);
    const isFavorited = user.favorites.some((id) => String(id) === listingIdStr);

    if (isFavorited) {
      user.favorites = user.favorites.filter((id) => String(id) !== listingIdStr);
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

    if (!Array.isArray(user.viewHistory)) user.viewHistory = [];

    const listingIdStr = String(listingId);
    // Remove existing entry for the listing
    user.viewHistory = user.viewHistory.filter((v) => String(v.listingId) !== listingIdStr);

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
