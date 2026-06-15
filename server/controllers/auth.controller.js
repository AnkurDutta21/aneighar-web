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

exports.phoneLogin = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ status: 'fail', message: 'idToken is required.' });
  }

  const { user, accessToken, refreshToken } = await authService.phoneLogin({ idToken });

  sendRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    status: 'success',
    data: { user, accessToken },
  });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const { name, role, phone } = req.body;
  const user = await authService.updateProfile(req.user._id, { name, role, phone });

  res.status(200).json({
    status: 'success',
    data: { user },
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

exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.status(200).json({
    status: 'success',
    message: 'Password reset link sent to email.',
  });
});

exports.resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  await authService.resetPassword(token, password);
  res.status(200).json({
    status: 'success',
    message: 'Password reset successful.',
  });
});
