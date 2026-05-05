const User = require('../models/User');
const AppError = require('../utils/AppError');
const {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshTokenCookie,
} = require('../utils/generateTokens');
const jwt = require('jsonwebtoken');

/**
 * Register a new user
 */
exports.register = async ({ name, email, password, role, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('An account with this email already exists.', 409);

  const user = await User.create({ name, email, password, role, phone });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

/**
 * Login an existing user
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
