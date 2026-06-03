const express = require('express');
const router = express.Router();
const pgController = require('../controllers/pg.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { upload, handleUploadErrors } = require('../middleware/upload');

// Public routes
router.get('/', pgController.getAllPGs);

// Owner-only routes (must come BEFORE /:id to avoid "owner" being matched as an ID)
router.get('/owner/my-listings', protect, restrictTo('owner'), pgController.getOwnerPGs);

// Public single listing route
router.get('/:id', pgController.getPGById);

// Owner-only mutation routes
router.post('/', protect, restrictTo('owner'), pgController.createPG);
router.put('/:id', protect, restrictTo('owner'), pgController.updatePG);
router.delete('/:id', protect, restrictTo('owner'), pgController.deletePG);
router.post('/:id/images', protect, restrictTo('owner'), handleUploadErrors(upload.array('images', 10)), pgController.uploadImages);
router.delete('/:id/images/:publicId', protect, restrictTo('owner'), pgController.deleteImage);

module.exports = router;
