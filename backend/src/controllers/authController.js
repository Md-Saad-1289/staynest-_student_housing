import User from '../models/User.js';
import { generateToken, validateEmail, validateMobile } from '../utils/helpers.js';

// Register
const register = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    if (!validateMobile(mobile)) {
      return res.status(400).json({ error: 'Invalid mobile number' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate role
    const validRoles = ['student', 'owner', 'admin'];
    const userRole = role || 'student';
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ error: 'Invalid role. Must be student, owner, or admin' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const newUser = new User({
      name,
      email,
      mobile,
      passwordHash: password,
      role: userRole,
      isVerified: userRole !== 'owner',
    });

    await newUser.save();

    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, mobile, profileImage, bio, university, location } = req.body;

    const updates = {};
    if (typeof name !== 'undefined') updates.name = name;
    if (typeof mobile !== 'undefined') updates.mobile = mobile;
    if (typeof profileImage !== 'undefined') updates.profileImage = profileImage;
    if (typeof bio !== 'undefined') updates.bio = bio;
    if (typeof university !== 'undefined') updates.university = university;
    if (typeof location !== 'undefined') updates.location = location;

    const updated = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({
      message: 'Profile updated',
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        mobile: updated.mobile,
        role: updated.role,
        isVerified: updated.isVerified,
        profileImage: updated.profileImage,
        bio: updated.bio,
        university: updated.university,
        location: updated.location,
        createdAt: updated.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { register, login, getCurrentUser, updateProfile };
