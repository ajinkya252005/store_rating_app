const express = require('express');
const router = express.Router();
const { getMyProfile, updatePassword } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Any authenticated user can view their own profile
router.get('/me', verifyToken, getMyProfile);

// Any authenticated user can update their own password
router.put('/me/password', verifyToken, updatePassword);

module.exports = router;
