const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('owner'));
router.get('/', dashboardController.getDashboard);

module.exports = router;
