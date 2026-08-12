import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRouter from './routes/auth.js';
import problemsRouter from './routes/problems.js';
import submissionsRouter from './routes/submissions.js';
import aiRouter from './routes/ai.js';
import usersRouter from './routes/users.js';
import learnRouter from './routes/learn.js';
import quizRouter from './routes/quiz.js';
import bookmarksRouter from './routes/bookmarks.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Main API Routes
app.use('/api/auth', authRouter);
app.use('/api/problems', problemsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/users', usersRouter);
app.use('/api/learn', learnRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/bookmarks', bookmarksRouter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), dbState: mongoose.connection.readyState });
});

app.listen(PORT, () => {
  console.log(`🚀 CodeForge Backend running on http://localhost:${PORT}`);
});
