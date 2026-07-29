const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/review.controller');
const { protect, restrictTo } = require('../middleware/auth');

// Public route to get reviews for a PG listing
router.get('/', reviewController.getPGReviews);

// Student route to post or update a review for a PG
router.post('/', protect, restrictTo('student'), reviewController.addOrUpdateReview);

// Delete review (by id)
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
