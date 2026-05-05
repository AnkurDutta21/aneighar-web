const savesService = require('../services/saves.service');
const catchAsync = require('../utils/catchAsync');

exports.toggleSave = catchAsync(async (req, res) => {
  const result = await savesService.toggleSave(req.user._id, req.params.pgId);
  res.status(200).json({ status: 'success', data: result });
});

exports.getSavedListings = catchAsync(async (req, res) => {
  const saved = await savesService.getSavedListings(req.user._id);
  res.status(200).json({ status: 'success', data: { saved } });
});
