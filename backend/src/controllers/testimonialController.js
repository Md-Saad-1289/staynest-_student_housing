import mongoose from 'mongoose';
import Testimonial from '../models/Testimonial.js';
import AuditLog from '../models/AuditLog.js';

// Get all approved testimonials (public)
const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ approved: true })
      .sort({ featured: -1, createdAt: -1 });
    res.json({ testimonials });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all testimonials (admin only)
const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ testimonials });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create testimonial (admin only)
const createTestimonial = async (req, res) => {
  try {
    const { name, tag, text, rating, approved, featured } = req.body;

    if (!name || !tag || !text || !rating) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const testimonial = new Testimonial({
      name,
      tag,
      text,
      rating: parseInt(rating),
      approved: approved || false,
      featured: featured || false,
      createdBy: req.user.userId,
    });

    await testimonial.save();

    await AuditLog.create({
      adminId: req.user.userId,
      action: 'create_testimonial',
      targetType: 'testimonial',
      targetId: testimonial._id,
      reason: 'New testimonial created',
      meta: { name: testimonial.name },
    });

    res.status(201).json({
      message: 'Testimonial created successfully',
      testimonial,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update testimonial (admin only)
const updateTestimonial = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid testimonial id' });
    }

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    const { name, tag, text, rating, approved, featured } = req.body;

    if (name) testimonial.name = name;
    if (tag) testimonial.tag = tag;
    if (text) testimonial.text = text;
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
      testimonial.rating = parseInt(rating);
    }
    if (approved !== undefined) testimonial.approved = approved;
    if (featured !== undefined) testimonial.featured = featured;

    await testimonial.save();

    await AuditLog.create({
      adminId: req.user.userId,
      action: 'update_testimonial',
      targetType: 'testimonial',
      targetId: testimonial._id,
      reason: 'Testimonial updated',
      meta: { name: testimonial.name },
    });

    res.json({
      message: 'Testimonial updated successfully',
      testimonial,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete testimonial (admin only)
const deleteTestimonial = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid testimonial id' });
    }

    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    await AuditLog.create({
      adminId: req.user.userId,
      action: 'delete_testimonial',
      targetType: 'testimonial',
      targetId: testimonial._id,
      reason: 'Testimonial deleted',
      meta: { name: testimonial.name },
    });

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle approval status
const toggleApproval = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid testimonial id' });
    }

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    testimonial.approved = !testimonial.approved;
    await testimonial.save();

    await AuditLog.create({
      adminId: req.user.userId,
      action: testimonial.approved ? 'approve_testimonial' : 'unapprove_testimonial',
      targetType: 'testimonial',
      targetId: testimonial._id,
      reason: `Testimonial ${testimonial.approved ? 'approved' : 'unapproved'}`,
      meta: { name: testimonial.name },
    });

    res.json({
      message: `Testimonial ${testimonial.approved ? 'approved' : 'unapproved'} successfully`,
      testimonial,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle featured status
const toggleFeatured = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid testimonial id' });
    }

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    testimonial.featured = !testimonial.featured;
    await testimonial.save();

    await AuditLog.create({
      adminId: req.user.userId,
      action: testimonial.featured ? 'feature_testimonial' : 'unfeature_testimonial',
      targetType: 'testimonial',
      targetId: testimonial._id,
      reason: `Testimonial ${testimonial.featured ? 'featured' : 'unfeatured'}`,
      meta: { name: testimonial.name },
    });

    res.json({
      message: `Testimonial ${testimonial.featured ? 'featured' : 'unfeatured'} successfully`,
      testimonial,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleApproval,
  toggleFeatured,
};
