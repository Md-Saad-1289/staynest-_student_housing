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
        mobile: newUser.mobile,
        role: newUser.role,
        isVerified: newUser.isVerified,
        profileImage: newUser.profileImage,
        bio: newUser.bio,
        university: newUser.university,
        location: newUser.location,
        linkedin: newUser.linkedin,
        twitter: newUser.twitter,
        website: newUser.website,
        dateOfBirth: newUser.dateOfBirth,
        studentId: newUser.studentId,
        major: newUser.major,
        academicYear: newUser.academicYear,
        addressStreet: newUser.addressStreet,
        addressCity: newUser.addressCity,
        addressZipCode: newUser.addressZipCode,
        addressCountry: newUser.addressCountry,
        emailNotifications: newUser.emailNotifications,
        smsNotifications: newUser.smsNotifications,
        pushNotifications: newUser.pushNotifications,
        budgetMin: newUser.budgetMin,
        budgetMax: newUser.budgetMax,
        roommatePreferences: newUser.roommatePreferences,
        gender: newUser.gender,
        emergencyContactName: newUser.emergencyContactName,
        emergencyContactPhone: newUser.emergencyContactPhone,
        createdAt: newUser.createdAt,
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
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        bio: user.bio,
        university: user.university,
        location: user.location,
        linkedin: user.linkedin,
        twitter: user.twitter,
        website: user.website,
        dateOfBirth: user.dateOfBirth,
        studentId: user.studentId,
        major: user.major,
        academicYear: user.academicYear,
        addressStreet: user.addressStreet,
        addressCity: user.addressCity,
        addressZipCode: user.addressZipCode,
        addressCountry: user.addressCountry,
        emailNotifications: user.emailNotifications,
        smsNotifications: user.smsNotifications,
        pushNotifications: user.pushNotifications,
        budgetMin: user.budgetMin,
        budgetMax: user.budgetMax,
        roommatePreferences: user.roommatePreferences,
        gender: user.gender,
        emergencyContactName: user.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone,
        createdAt: user.createdAt,
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
        profileImage: user.profileImage,
        bio: user.bio,
        university: user.university,
        location: user.location,
        linkedin: user.linkedin,
        twitter: user.twitter,
        website: user.website,
        // New fields
        dateOfBirth: user.dateOfBirth,
        studentId: user.studentId,
        major: user.major,
        academicYear: user.academicYear,
        addressStreet: user.addressStreet,
        addressCity: user.addressCity,
        addressZipCode: user.addressZipCode,
        addressCountry: user.addressCountry,
        emailNotifications: user.emailNotifications,
        smsNotifications: user.smsNotifications,
        pushNotifications: user.pushNotifications,
        budgetMin: user.budgetMin,
        budgetMax: user.budgetMax,
        roommatePreferences: user.roommatePreferences,
        gender: user.gender,
        emergencyContactName: user.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone,
        createdAt: user.createdAt,
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
    const { 
      name, mobile, profileImage, bio, university, location, linkedin, twitter, website,
      dateOfBirth, studentId, major, academicYear, 
      addressStreet, addressCity, addressZipCode, addressCountry,
      emailNotifications, smsNotifications, pushNotifications,
      budgetMin, budgetMax, roommatePreferences, gender,
      emergencyContactName, emergencyContactPhone 
    } = req.body;

    // Validate inputs
    if (name && typeof name === 'string' && name.trim().length === 0) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    if (mobile && typeof mobile === 'string') {
      const digits = mobile.replace(/[^0-9]/g, '');
      if (digits.length < 8) {
        return res.status(400).json({ error: 'Phone number must have at least 8 digits' });
      }
    }

    // Validate dates
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dob > today) {
        return res.status(400).json({ error: 'Date of birth cannot be in the future' });
      }
      // Check if age is at least 13 years old
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        const actualAge = age - 1;
        if (actualAge < 13) {
          return res.status(400).json({ error: 'You must be at least 13 years old' });
        }
      } else if (age < 13) {
        return res.status(400).json({ error: 'You must be at least 13 years old' });
      }
    }

    // Validate budget
    if (budgetMin && budgetMax) {
      const minBudget = typeof budgetMin === 'string' ? parseFloat(budgetMin) : budgetMin;
      const maxBudget = typeof budgetMax === 'string' ? parseFloat(budgetMax) : budgetMax;
      if (minBudget > maxBudget) {
        return res.status(400).json({ error: 'Minimum budget cannot be greater than maximum budget' });
      }
    }

    // Validate academic year
    const validAcademicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Masters', 'PhD'];
    if (academicYear && !validAcademicYears.includes(academicYear)) {
      return res.status(400).json({ error: 'Invalid academic year' });
    }

    // Validate gender
    const validGenders = ['Male', 'Female', 'Other'];
    if (gender && !validGenders.includes(gender)) {
      return res.status(400).json({ error: 'Invalid gender selection' });
    }

    const updates = {};
    if (typeof name !== 'undefined' && name !== null) updates.name = name.trim();
    if (typeof mobile !== 'undefined' && mobile !== null) updates.mobile = mobile;
    if (typeof profileImage !== 'undefined') {
      // Validate profileImage size (max 2MB) only for inline/base64 images.
      if (profileImage && typeof profileImage === 'string') {
        // If profileImage is a data URL (base64), estimate size; otherwise assume it's a URL and skip size check.
        if (profileImage.startsWith('data:')) {
          try {
            const base64Data = profileImage.split(',')[1] || '';
            // approximate bytes from base64 length
            const padding = (base64Data.endsWith('==') ? 2 : (base64Data.endsWith('=') ? 1 : 0));
            const sizeInBytes = Math.floor((base64Data.length * 3) / 4) - padding;
            if (sizeInBytes > 2 * 1024 * 1024) {
              return res.status(400).json({ error: 'Profile image is too large. Maximum size is 2MB' });
            }
          } catch (err) {
            // If parsing fails, reject to be safe
            return res.status(400).json({ error: 'Invalid profile image data' });
          }
        }
      }
      updates.profileImage = profileImage;
    }
    if (typeof bio !== 'undefined') updates.bio = bio;
    if (typeof university !== 'undefined') updates.university = university;
    if (typeof location !== 'undefined') updates.location = location;
    if (typeof linkedin !== 'undefined') updates.linkedin = linkedin;
    if (typeof twitter !== 'undefined') updates.twitter = twitter;
    if (typeof website !== 'undefined') updates.website = website;
    if (typeof dateOfBirth !== 'undefined') updates.dateOfBirth = dateOfBirth;
    if (typeof studentId !== 'undefined') updates.studentId = studentId;
    if (typeof major !== 'undefined') updates.major = major;
    if (typeof academicYear !== 'undefined') updates.academicYear = academicYear;
    if (typeof addressStreet !== 'undefined') updates.addressStreet = addressStreet;
    if (typeof addressCity !== 'undefined') updates.addressCity = addressCity;
    if (typeof addressZipCode !== 'undefined') updates.addressZipCode = addressZipCode;
    if (typeof addressCountry !== 'undefined') updates.addressCountry = addressCountry;
    if (typeof emailNotifications !== 'undefined') updates.emailNotifications = emailNotifications;
    if (typeof smsNotifications !== 'undefined') updates.smsNotifications = smsNotifications;
    if (typeof pushNotifications !== 'undefined') updates.pushNotifications = pushNotifications;
    if (typeof budgetMin !== 'undefined' && budgetMin !== null && budgetMin !== '') updates.budgetMin = parseFloat(budgetMin);
    if (typeof budgetMax !== 'undefined' && budgetMax !== null && budgetMax !== '') updates.budgetMax = parseFloat(budgetMax);
    if (typeof roommatePreferences !== 'undefined') updates.roommatePreferences = roommatePreferences;
    if (typeof gender !== 'undefined') updates.gender = gender;
    if (typeof emergencyContactName !== 'undefined') updates.emergencyContactName = emergencyContactName;
    if (typeof emergencyContactPhone !== 'undefined') updates.emergencyContactPhone = emergencyContactPhone;

    // Use runValidators to ensure enums and types are enforced on update
    const updated = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true, context: 'query' });
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
        linkedin: updated.linkedin,
        twitter: updated.twitter,
        website: updated.website,
        dateOfBirth: updated.dateOfBirth,
        studentId: updated.studentId,
        major: updated.major,
        academicYear: updated.academicYear,
        addressStreet: updated.addressStreet,
        addressCity: updated.addressCity,
        addressZipCode: updated.addressZipCode,
        addressCountry: updated.addressCountry,
        emailNotifications: updated.emailNotifications,
        smsNotifications: updated.smsNotifications,
        pushNotifications: updated.pushNotifications,
        budgetMin: updated.budgetMin,
        budgetMax: updated.budgetMax,
        roommatePreferences: updated.roommatePreferences,
        gender: updated.gender,
        emergencyContactName: updated.emergencyContactName,
        emergencyContactPhone: updated.emergencyContactPhone,
        createdAt: updated.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    user.passwordHash = newPassword;
    await user.save();

    res.json({ message: 'Password changed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { register, login, getCurrentUser, updateProfile, changePassword };
