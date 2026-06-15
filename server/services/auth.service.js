const User = require('../models/User');
const AppError = require('../utils/AppError');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/generateTokens');
const jwt = require('jsonwebtoken');

/**
 * Register a new user (email/password)
 */
exports.register = async ({ name, email, password, role, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('An account with this email already exists.', 409);

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone: phone || undefined,
    isOnboarded: false, // triggers onboarding modal on client
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

/**
 * Login an existing user (email/password)
 */
exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

/**
 * Phone OTP login via Firebase idToken
 * Verifies the Firebase token, then upserts user in MongoDB
 */
exports.phoneLogin = async ({ idToken }) => {
  const admin = require('./firebaseAdmin');

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch {
    throw new AppError('Invalid or expired OTP. Please try again.', 401);
  }

  const { uid, phone_number: phone } = decodedToken;
  if (!phone) throw new AppError('Phone number not found in token.', 400);

  // Try to find existing user by Firebase UID
  let user = await User.findOne({ firebaseUid: uid });
  const isNewUser = !user;

  if (!user) {
    // Check if a user with this phone exists (e.g. registered via email+phone before)
    user = await User.findOne({ phone });
    if (user) {
      // Link Firebase UID to existing account
      user.firebaseUid = uid;
      user.phoneVerified = true;
      await user.save({ validateBeforeSave: false });
    } else {
      // Brand-new phone user
      user = await User.create({
        firebaseUid: uid,
        phone,
        phoneVerified: true,
        role: 'student', // default, will be updated via onboarding
        isOnboarded: false,
      });
    }
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken, isNewUser };
};

/**
 * Update user profile (used during onboarding)
 */
exports.updateProfile = async (userId, { name, role, phone }) => {
  const updateData = { isOnboarded: true };
  if (name !== undefined) updateData.name = name;
  if (role !== undefined) updateData.role = role;
  if (phone !== undefined) {
    updateData.phone = phone;
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new AppError('User not found.', 404);
  return user;
};

/**
 * Refresh access token using refresh token from cookie
 */
exports.refreshToken = async (token) => {
  if (!token) throw new AppError('No refresh token provided.', 401);

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Logout — clear refresh token
 */
exports.logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: '' });
};

/**
 * Forgot password - generate reset token and send email
 */
exports.forgotPassword = async (email) => {
  const crypto = require('crypto');
  if (!email) throw new AppError('Please provide an email address.', 400);

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('No account found with this email.', 404);
  }

  // Generate a random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the token and set it to user document with expiration (1 hour)
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 3600000; // 1 hour

  await user.save({ validateBeforeSave: false });

  // Send email
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  
  const emailService = require('./email.service');
  await emailService.sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl,
  });

  return resetToken;
};

/**
 * Reset password - verify token and update password
 */
exports.resetPassword = async (token, password) => {
  const crypto = require('crypto');
  if (!token) throw new AppError('Reset token is required.', 400);
  if (!password) throw new AppError('Please provide a new password.', 400);

  // Hash token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with matching token and valid expiry
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Reset link is invalid or has expired.', 400);
  }

  // Update password and clear reset token fields
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save(); // will trigger pre('save') hash
  return user;
};
