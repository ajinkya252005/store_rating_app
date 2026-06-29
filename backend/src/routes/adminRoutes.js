const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, createStore, getDashboardStats, adminGetAllStores } = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Dashboard
router.get('/dashboard', verifyToken, requireRole('SYSTEM_ADMIN'), getDashboardStats);

// Users
router.get('/users', verifyToken, requireRole('SYSTEM_ADMIN'), getAllUsers);
router.post('/users', verifyToken, requireRole('SYSTEM_ADMIN'), createUser);

// Stores (admin view)
router.get('/stores', verifyToken, requireRole('SYSTEM_ADMIN'), adminGetAllStores);
router.post('/stores', verifyToken, requireRole('SYSTEM_ADMIN'), createStore);

module.exports = router;