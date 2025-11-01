<div align="center">
  <h1>FitSage - Train Smart. Live Wise.</h1>

  <p>
    <strong>An AI-powered fitness companion that transforms your wellness journey</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-Atlas-brightgreen?style=for-the-badge&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/AI-Powered-orange?style=for-the-badge&logo=openai" alt="AI Powered" />
  </p>
</div>

---

## Overview

FitSage is an AI-powered fitness companion that combines intelligent workout planning with mindful living. Built with the MERN stack and powered by Large Language Models (GPT-4/Claude), it provides personalized workout and nutrition plans, progress tracking, and real-time AI coaching.

### Key Highlights
- **AI-Powered**: Leverages GPT-4 or Claude for truly personalized fitness guidance
- **Smart Tracking**: Comprehensive progress monitoring with beautiful visualizations
- **AI Coach**: 24/7 personal trainer in your pocket
- **Streak System**: Gamified motivation to keep you consistent
- **Responsive**: Beautiful UI that works seamlessly on all devices

## Features

### Core Functionality
- **AI-Powered Personalization**: Generate custom workout and nutrition plans based on your profile, goals, and preferences
- **Smart Progress Tracking**: Monitor your fitness journey with detailed statistics and visual charts
- **AI Coach Chat**: Get instant guidance, tips, and motivation from your personal AI trainer
- **Streak System**: Stay motivated with daily workout streaks and achievements
- **Comprehensive Dashboard**: View all your fitness metrics and active plans at a glance
- **Responsive Design**: Beautiful, mobile-friendly interface built with Material UI

### What Makes FitSage Special
- **Truly Personalized**: Unlike generic fitness apps, FitSage uses advanced AI to understand your unique needs
- **Holistic Approach**: Combines workouts, nutrition, and mental wellness in one platform
- **Adaptive Learning**: Plans evolve based on your progress and feedback
- **Privacy-First**: Your data stays secure with JWT authentication and encrypted storage

## Tech Stack

### Frontend
- **React** - UI library
- **Material UI (MUI)** - Component library
- **Vite** - Build tool
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### AI Integration
- **OpenAI API** (GPT-4) or **Anthropic API** (Claude) for:
  - Personalized workout plan generation
  - Custom nutrition plan creation
  - Conversational AI coaching

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- OpenAI API key or Anthropic API key

## Installation

### 1. Clone the repository
```bash
cd FitSage
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your credentials
# - Add your MongoDB Atlas connection string
# - Add your AI API key (OpenAI or Anthropic)
# - Set a secure JWT secret
```

#### MongoDB Atlas Setup:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace `<username>`, `<password>`, and `<cluster-url>` in your `.env` file

#### AI API Key:
- **For OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **For Anthropic**: Get your API key from [Anthropic Console](https://console.anthropic.com/)

### 3. Frontend Setup

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# The default API URL (http://localhost:5000/api) should work for local development
```

## Running the Application

### Development Mode

You'll need two terminal windows:

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Access the Application

Open your browser and navigate to `http://localhost:5173`

## Usage Guide

### 1. Create an Account
- Click "Get Started" or "Sign Up"
- Fill in your details
- Complete your profile with age, weight, height, fitness level, etc.

### 2. Generate Your Plans
- **Workout Plan**: Navigate to "Workouts" and click "Generate New Plan"
  - The AI will create a personalized 4-week workout plan
  - View exercises, sets, reps, and instructions

- **Nutrition Plan**: Navigate to "Nutrition" and click "Generate New Plan"
  - Get custom meal plans with recipes and nutritional information
  - Track daily calorie and macro targets

### 3. Track Your Progress
- Log your workouts, weight, and other metrics in the "Progress" section
- View charts and statistics for different time periods
- Monitor your improvements over time

### 4. Chat with AI Coach
- Click "AI Coach" in the sidebar
- Ask questions about fitness, nutrition, or wellness
- Get instant personalized advice and motivation

### 5. Monitor Your Dashboard
- View your current streak
- See weekly workout and calorie statistics
- Quick access to active plans and achievements

## Project Structure

```
FitSage/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth middleware
│   │   ├── services/        # AI service
│   │   └── server.js        # Entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── utils/           # Utilities & contexts
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # Entry point
│   ├── public/
│   ├── package.json
│   └── .env.example
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### User
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user` - Update user info
- `GET /api/user/streak` - Get user streak
- `POST /api/user/streak` - Update streak
- `GET /api/user/achievements` - Get achievements

### Workouts
- `POST /api/workout/generate` - Generate workout plan
- `GET /api/workout` - Get all workout plans
- `GET /api/workout/active` - Get active plan
- `GET /api/workout/:id` - Get specific plan
- `PUT /api/workout/:id` - Update plan
- `DELETE /api/workout/:id` - Delete plan
- `POST /api/workout/:id/activate` - Activate plan

### Nutrition
- `POST /api/nutrition/generate` - Generate nutrition plan
- `GET /api/nutrition` - Get all nutrition plans
- `GET /api/nutrition/active` - Get active plan
- `GET /api/nutrition/:id` - Get specific plan
- `PUT /api/nutrition/:id` - Update plan
- `DELETE /api/nutrition/:id` - Delete plan
- `POST /api/nutrition/:id/activate` - Activate plan

### Progress
- `POST /api/progress` - Log progress entry
- `GET /api/progress` - Get progress entries
- `GET /api/progress/stats?period=week|month|year` - Get statistics
- `GET /api/progress/:id` - Get specific entry
- `PUT /api/progress/:id` - Update entry
- `DELETE /api/progress/:id` - Delete entry

### Chat
- `POST /api/chat` - Send message to AI coach

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitsage
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
AI_PROVIDER=openai
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

- UI inspired by nature and mindful living
- Material UI for the beautiful component library

---

**Train Smart. Live Wise.**
