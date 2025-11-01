import AIService from './aiService.js';

// Create singleton instance - this file is imported after dotenv.config()
const aiServiceInstance = new AIService();

export default aiServiceInstance;
