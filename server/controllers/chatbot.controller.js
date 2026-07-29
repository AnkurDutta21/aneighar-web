const chatbotService = require('../services/chatbot.service');
const catchAsync = require('../utils/catchAsync');

exports.getRecommendations = catchAsync(async (req, res) => {
  const { message, history, userLocation } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a message to get recommendations.',
    });
  }

  const result = await chatbotService.getRecommendations(message, history, userLocation);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
