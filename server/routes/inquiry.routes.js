const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiry.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

// Student: send inquiry
router.post('/', restrictTo('student'), inquiryController.createInquiry);
router.get('/my-inquiries', restrictTo('student'), inquiryController.getStudentInquiries);

// Owner: view and manage
router.get('/owner', restrictTo('owner'), inquiryController.getOwnerInquiries);
router.patch('/:id/status', restrictTo('owner'), inquiryController.updateStatus);

module.exports = router;
