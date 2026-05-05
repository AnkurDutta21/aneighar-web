const dashboardService = require('../services/dashboard.service');
const catchAsync = require('../utils/catchAsync');

exports.getDashboard = catchAsync(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user._id);
  res.status(200).json({ status: 'success', data: stats });
});
