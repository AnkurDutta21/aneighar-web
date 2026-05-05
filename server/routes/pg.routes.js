const express = require('express');
const router = express.Router();
const pgController = require('../controllers/pg.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/', pgController.getAllPGs);
router.get('/:id', pgController.getPGById);

// Owner-only routes
router.use(protect, restrictTo('owner'));
router.get('/owner/my-listings', pgController.getOwnerPGs);
router.post('/', pgController.createPG);
router.put('/:id', pgController.updatePG);
router.delete('/:id', pgController.deletePG);
router.post('/:id/images', upload.array('images', 10), pgController.uploadImages);
router.delete('/:id/images/:publicId', pgController.deleteImage);

module.exports = router;
