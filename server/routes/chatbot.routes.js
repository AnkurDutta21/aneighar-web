const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');

router.post('/recommend', chatbotController.getRecommendations);

module.exports = router;
