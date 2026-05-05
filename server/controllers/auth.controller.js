const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const { sendRefreshTokenCookie } = require('../utils/generateTokens');

exports.register = catchAsync(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const { user, accessToken, refreshToken } = await authService.register({
    name, email, password, role, phone,
  });

  sendRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    status: 'success',
    data: { user, accessToken },
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login({ email, password });

  sendRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    status: 'success',
    data: { user, accessToken },
  });
});

exports.refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken;
  const { user, accessToken, refreshToken } = await authService.refreshToken(token);

  sendRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    status: 'success',
    data: { user, accessToken },
  });
});

exports.logout = catchAsync(async (req, res) => {
  await authService.logout(req.user._id);
  res.clearCookie('refreshToken');
  res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
});

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
});
