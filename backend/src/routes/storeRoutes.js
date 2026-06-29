const express = require('express');
const router = express.Router();
const { getAllStores, getMyStore, getStoreById, submitRating, updateRating } = require('../controllers/storeController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// IMPORTANT: /my-store must be defined BEFORE /:id to prevent Express
// from treating the literal string "my-store" as a UUID param.

// All authenticated users can list stores
router.get('/', verifyToken, getAllStores);

// STORE_OWNER views their own store dashboard
router.get('/my-store', verifyToken, requireRole('STORE_OWNER'), getMyStore);

// Any authenticated user can view a specific store
router.get('/:id', verifyToken, getStoreById);

// NORMAL_USER submits a new rating
router.post('/:id/ratings', verifyToken, requireRole('NORMAL_USER'), submitRating);

// NORMAL_USER updates their existing rating
router.put('/:id/ratings', verifyToken, requireRole('NORMAL_USER'), updateRating);

module.exports = router;
