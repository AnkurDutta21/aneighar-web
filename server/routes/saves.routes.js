const express = require('express');
const router = express.Router();
const savesController = require('../controllers/saves.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('student'));

router.get('/', savesController.getSavedListings);
router.post('/:pgId', savesController.toggleSave);

module.exports = router;
