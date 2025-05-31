import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketService } from './services/WebSocketService';
import { errorHandler } from './middleware/errorHandler';
import { checkDocumentAccess, rateLimiter } from './middleware/accessControl';
import documentRoutes from './routes/documents';
import authRoutes from './routes/auth';
import { Request, Response, NextFunction } from 'express';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate limiting for all routes
const globalRateLimiter = rateLimiter(60 * 1000, 100); // 100 requests per minute
app.use(globalRateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', checkDocumentAccess, documentRoutes);

// Error handling middleware must be registered last
app.use(errorHandler as express.ErrorRequestHandler);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-editor')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Initialize WebSocket service
const wsService = new WebSocketService(server);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 