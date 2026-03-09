import User from '../models/User.js';
import { generateToken, validateEmail, validateMobile } from '../utils/helpers.js';
import validator from 'validator';

// Register (minimal)
const register = async (req, res) => {
  try {
    const { name, email, mobile, phoneNo, password, role, nidNumber, adminSecret } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    // Validate name (not empty after trim, reasonable length)
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({ error: 'Name must be between 2 and 100 characters' });
    }

    // Trim and normalize email before validation
    const emailTrimmed = email.trim();

    // Validate email format
    if (!validateEmail(emailTrimmed)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Validate password is string and not empty
    if (typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: 'Password must be a valid string' });
    }

    // Validate role: allow admin only with correct secret
    let userRole = role || 'student';
    
    if (userRole === 'admin') {
      const expectedSecret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'admin-secret-key';
      if (adminSecret !== expectedSecret) {
        return res.status(400).json({ error: 'Invalid role' });
      }
    }
    
    if (!['student', 'owner', 'admin'].includes(userRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Accept either `phoneNo` or legacy `mobile`
    const finalPhone = (phoneNo || mobile || '').trim();
    if (finalPhone && !validateMobile(finalPhone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Check if email already exists
    const exists = await User.findOne({ email: emailTrimmed.toLowerCase() });
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      name: trimmedName,
      email: emailTrimmed.toLowerCase(),
      phoneNo: finalPhone,
      mobile: finalPhone,
      passwordHash: password,
      role: userRole,
      isVerified: userRole !== 'owner',
      nidNumber: ''
    });

    await user.save();
    const token = generateToken(user._id, user.role);

    return res.status(201).json({ 
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
        role: user.role,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        nidNumber: user.nidNumber,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Register error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      field: err.path
    });
    
    // Handle specific MongoDB validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Basic type checks
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password must be strings' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if account is banned
    if (user.isBanned) {
      return res.status(403).json({ error: 'Your account has been banned' });
    }

    const token = generateToken(user._id, user.role);
    return res.json({ token, user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNo: user.phoneNo,
      role: user.role,
      isVerified: user.isVerified,
      profileImage: user.profileImage,
      nidNumber: user.nidNumber,
      createdAt: user.createdAt
    }});
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
};

// Get current user (minimal)
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({ user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNo: user.phoneNo,
      fullAddress: user.fullAddress,
      dob: user.dob,
      gender: user.gender,
      emergencyContact: user.emergencyContact,
      profileImage: user.profileImage,
      role: user.role,
      isVerified: user.isVerified,
      nidNumber: user.role === 'owner' ? user.nidNumber : undefined,
      createdAt: user.createdAt
    }});
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Update profile (secure, whitelist-based)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Allowed fields
    const allowedCommon = ['name', 'phoneNo', 'mobile', 'fullAddress', 'dob', 'gender', 'emergencyContact', 'profileImage'];
    const allowedOwner = [...allowedCommon, 'nidNumber'];
    const allowed = user.role === 'owner' ? allowedOwner : allowedCommon;

    // Reject attempts to change protected fields
    const forbidden = ['email', 'role', 'isVerified', 'password', 'passwordHash', 'createdAt'];
    for (const f of forbidden) {
      if (Object.prototype.hasOwnProperty.call(req.body, f)) {
        return res.status(400).json({ error: `Cannot update field: ${f}` });
      }
    }

    // Students cannot send nidNumber
    if (user.role === 'student' && Object.prototype.hasOwnProperty.call(req.body, 'nidNumber')) {
      return res.status(400).json({ error: 'Students cannot provide nidNumber' });
    }

    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        let val = req.body[key];

        if (key === 'profileImage') {
          if (typeof val === 'string' && validator.isURL(val, { protocols: ['http', 'https'], require_protocol: true })) {
            updates.profileImage = val.trim();
          }
          continue;
        }

        if (key === 'dob') {
          const d = new Date(val);
          if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid dob' });
          updates.dob = d;
          continue;
        }

        // normalize mobile/phoneNo: set both fields when provided
        if (key === 'phoneNo' || key === 'mobile') {
          const s = typeof val === 'string' ? validator.escape(val.trim()) : val;
          updates.phoneNo = s;
          updates.mobile = s;
          continue;
        }

        if (typeof val === 'string') updates[key] = validator.escape(val.trim());
        else updates[key] = val;
      }
    }

    // Apply updates explicitly
    Object.keys(updates).forEach(k => { user[k] = updates[k]; });
    await user.save();

    return res.json({ user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNo: user.phoneNo,
      fullAddress: user.fullAddress,
      dob: user.dob,
      gender: user.gender,
      emergencyContact: user.emergencyContact,
      profileImage: user.profileImage,
      role: user.role,
      isVerified: user.isVerified,
      nidNumber: user.role === 'owner' ? user.nidNumber : undefined,
      createdAt: user.createdAt
    }});
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'current password, new password, and confirmation required' });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Prevent using same password
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password cannot be the same as current password' });
    }

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Set new password (will be hashed by pre-save hook)
    user.passwordHash = newPassword;
    await user.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ error: err.message || 'Failed to change password' });
  }
};

export { register, login, getCurrentUser, updateProfile, changePassword };
