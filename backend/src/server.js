import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';

// Load environment variables FIRST
dotenv.config();

// Verify environment variables are loaded
console.log('Environment variables loaded:');
console.log('- AI_PROVIDER:', process.env.AI_PROVIDER);
console.log('- ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'Set' : 'Not set');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FitSage API is running' });
});

// Import and setup routes using dynamic imports AFTER env vars are loaded
const setupRoutes = async () => {
  const authRoutes = (await import('./routes/auth.js')).default;
  const userRoutes = (await import('./routes/user.js')).default;
  const workoutRoutes = (await import('./routes/workout.js')).default;
  const nutritionRoutes = (await import('./routes/nutrition.js')).default;
  const progressRoutes = (await import('./routes/progress.js')).default;
  const chatRoutes = (await import('./routes/chat.js')).default;
  const workoutLogRoutes = (await import('./routes/workoutLog.js')).default;
  const nutritionLogRoutes = (await import('./routes/nutritionLog.js')).default;

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/workout', workoutRoutes);
  app.use('/api/nutrition', nutritionRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/workout-logs', workoutLogRoutes);
  app.use('/api/nutrition-logs', nutritionLogRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  });

  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

// Setup routes and start server
setupRoutes().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
