const reviewService = require('../services/review.service');
const catchAsync = require('../utils/catchAsync');

exports.addOrUpdateReview = catchAsync(async (req, res) => {
  const { pgId } = req.params;
  const review = await reviewService.addOrUpdateReview(pgId, req.user._id, req.body);
  res.status(200).json({ status: 'success', data: { review } });
});

exports.getPGReviews = catchAsync(async (req, res) => {
  const { pgId } = req.params;
  const result = await reviewService.getPGReviews(pgId, req.query);
  res.status(200).json({ status: 'success', data: result });
});

exports.deleteReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  await reviewService.deleteReview(id, req.user._id);
  res.status(204).json({ status: 'success', data: null });
});
