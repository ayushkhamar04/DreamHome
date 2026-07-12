const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware - Updated CORS to allow your Vercel frontend
app.use(
  cors({
    origin: [
      'http://localhost:3000', // Local development
      'https://dream-home-uxjv.vercel.app', // Your production frontend
      'https://*.vercel.app' // All Vercel preview deployments
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/inquiries', require('./routes/inquiries')); // New inquiry routes
app.use('/api/messages', require('./routes/messages'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'DreamHome API Server',
    status: 'Running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      properties: '/api/properties',
      favorites: '/api/favorites',
      admin: '/api/admin',
      inquiries: '/api/inquiries'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});