import aiService from '../services/aiServiceInstance.js';

export const chat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get AI response
    const response = await aiService.chatWithTrainer(
      message,
      conversationHistory || []
    );

    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting response from AI trainer',
      error: error.message
    });
  }
};
