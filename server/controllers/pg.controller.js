const pgService = require('../services/pg.service');
const { cloudinary } = require('../middleware/upload');
const catchAsync = require('../utils/catchAsync');

exports.getAllPGs = catchAsync(async (req, res) => {
  const result = await pgService.getAllPGs(req.query);
  res.status(200).json({ status: 'success', ...result });
});

exports.getPGById = catchAsync(async (req, res) => {
  const pg = await pgService.getPGById(req.params.id);
  res.status(200).json({ status: 'success', data: { pg } });
});

exports.createPG = catchAsync(async (req, res) => {
  const pg = await pgService.createPG(req.user._id, req.body);
  res.status(201).json({ status: 'success', data: { pg } });
});

exports.updatePG = catchAsync(async (req, res) => {
  const pg = await pgService.updatePG(req.params.id, req.user._id, req.body);
  res.status(200).json({ status: 'success', data: { pg } });
});

exports.deletePG = catchAsync(async (req, res) => {
  await pgService.deletePG(req.params.id, req.user._id);
  res.status(204).json({ status: 'success', data: null });
});

exports.uploadImages = catchAsync(async (req, res) => {
  const pg = await pgService.addImages(req.params.id, req.user._id, req.files);
  res.status(200).json({ status: 'success', data: { pg } });
});

exports.deleteImage = catchAsync(async (req, res) => {
  const pg = await pgService.removeImage(
    req.params.id,
    req.user._id,
    req.params.publicId,
    cloudinary
  );
  res.status(200).json({ status: 'success', data: { pg } });
});

exports.getOwnerPGs = catchAsync(async (req, res) => {
  const listings = await pgService.getOwnerPGs(req.user._id);
  res.status(200).json({ status: 'success', data: { listings } });
});
