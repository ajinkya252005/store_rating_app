const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');

const app = express();

// Routes
const authRoutes  = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');
const userRoutes  = require('./routes/userRoutes');

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Store Rating API!' });
});

// Authentication (public)
app.use('/api/auth', authRoutes);

// Admin (SYSTEM_ADMIN only)
app.use('/api/admin', adminRoutes);

// Stores & Ratings (authenticated)
app.use('/api/stores', storeRoutes);

// User profile & password (authenticated)
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is successfully running on port ${PORT}`);
});