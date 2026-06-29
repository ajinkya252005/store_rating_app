const pool = require('../db');
const { validateScore } = require('../middleware/validateMiddleware');

// ─────────────────────────────────────────────────────────────────
// GET /api/stores
// Authenticated (any role).
// Returns all stores with average_rating.
// For NORMAL_USER: also includes their own submitted rating (user_rating).
// Query params: name, address, sort, order
// ─────────────────────────────────────────────────────────────────
const getAllStores = async (req, res) => {
  try {
    const { name, address, sort, order } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    const allowedSortFields = ['name', 'address', 'average_rating'];
    const allowedOrders = ['asc', 'desc'];

    const sortField = allowedSortFields.includes(sort) ? sort : 'name';
    const sortOrder = allowedOrders.includes(order?.toLowerCase()) ? order.toLowerCase() : 'asc';

    const conditions = [];
    const values = [];
    let idx = 1;

    if (name) {
      conditions.push(`LOWER(s.name) LIKE $${idx++}`);
      values.push(`%${name.toLowerCase()}%`);
    }
    if (address) {
      conditions.push(`LOWER(s.address) LIKE $${idx++}`);
      values.push(`%${address.toLowerCase()}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // For NORMAL_USER include their own rating via LEFT JOIN filtered to their user id
    const userRatingSelect = userRole === 'NORMAL_USER'
      ? `, ur.score AS user_rating`
      : '';

    const userRatingJoin = userRole === 'NORMAL_USER'
      ? `LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $${idx++}`
      : '';

    if (userRole === 'NORMAL_USER') {
      values.push(userId);
    }

    const query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        ROUND(AVG(r.score), 2) AS average_rating,
        COUNT(r.id) AS total_ratings
        ${userRatingSelect}
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      ${userRatingJoin}
      ${whereClause}
      GROUP BY s.id${userRole === 'NORMAL_USER' ? ', ur.score' : ''}
      ORDER BY ${sortField === 'average_rating' ? 'average_rating' : `s.${sortField}`} ${sortOrder} NULLS LAST
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching stores' });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/stores/my-store
// STORE_OWNER only.
// Returns the store owned by the logged-in user with full ratings list.
// ─────────────────────────────────────────────────────────────────
const getMyStore = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Get the store
    const storeResult = await pool.query(
      `SELECT 
        s.*,
        ROUND(AVG(r.score), 2) AS average_rating,
        COUNT(r.id) AS total_ratings
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [ownerId]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'No store found for your account.' });
    }

    const store = storeResult.rows[0];

    // Get all ratings for this store with rater info
    const ratingsResult = await pool.query(
      `SELECT 
        r.id,
        r.score,
        r.created_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [store.id]
    );

    res.json({
      ...store,
      ratings: ratingsResult.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching your store' });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/stores/:id
// Authenticated (any role).
// Returns single store with average_rating.
// If caller is NORMAL_USER: includes their own rating.
// If caller is STORE_OWNER who owns this store: includes full ratings list.
// ─────────────────────────────────────────────────────────────────
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const storeResult = await pool.query(
      `SELECT 
        s.*,
        ROUND(AVG(r.score), 2) AS average_rating,
        COUNT(r.id) AS total_ratings
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const store = storeResult.rows[0];
    const response = { ...store };

    // For NORMAL_USER: attach their own rating
    if (userRole === 'NORMAL_USER') {
      const myRating = await pool.query(
        'SELECT score FROM ratings WHERE store_id = $1 AND user_id = $2',
        [id, userId]
      );
      response.user_rating = myRating.rows.length > 0 ? myRating.rows[0].score : null;
    }

    // For STORE_OWNER viewing their own store: attach full ratings list
    if (userRole === 'STORE_OWNER' && store.owner_id === userId) {
      const ratingsResult = await pool.query(
        `SELECT 
          r.id, r.score, r.created_at,
          u.id AS user_id, u.name AS user_name, u.email AS user_email
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.store_id = $1
         ORDER BY r.created_at DESC`,
        [id]
      );
      response.ratings = ratingsResult.rows;
    }

    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching store' });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/stores/:id/ratings
// NORMAL_USER only.
// Submit a rating (1–5) for a store. One rating per user per store.
// ─────────────────────────────────────────────────────────────────
const submitRating = async (req, res) => {
  try {
    const { id: storeId } = req.params;
    const userId = req.user.id;
    const { score } = req.body;

    // Validate score
    const scoreCheck = validateScore(score);
    if (!scoreCheck.valid) return res.status(400).json({ error: scoreCheck.error });

    // Verify the store exists
    const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check for existing rating
    const existing = await pool.query(
      'SELECT id FROM ratings WHERE store_id = $1 AND user_id = $2',
      [storeId, userId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        error: 'You have already rated this store. Use PUT to update your rating.' 
      });
    }

    const newRating = await pool.query(
      `INSERT INTO ratings (store_id, user_id, score) 
       VALUES ($1, $2, $3) RETURNING *`,
      [storeId, userId, parseInt(score, 10)]
    );

    res.status(201).json({ 
      message: 'Rating submitted successfully', 
      rating: newRating.rows[0] 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while submitting rating' });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUT /api/stores/:id/ratings
// NORMAL_USER only.
// Update an existing rating for a store.
// ─────────────────────────────────────────────────────────────────
const updateRating = async (req, res) => {
  try {
    const { id: storeId } = req.params;
    const userId = req.user.id;
    const { score } = req.body;

    // Validate score
    const scoreCheck = validateScore(score);
    if (!scoreCheck.valid) return res.status(400).json({ error: scoreCheck.error });

    // Verify the store exists
    const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if rating exists
    const existing = await pool.query(
      'SELECT id FROM ratings WHERE store_id = $1 AND user_id = $2',
      [storeId, userId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No existing rating found. Use POST to submit a new rating.' 
      });
    }

    const updatedRating = await pool.query(
      `UPDATE ratings SET score = $1 
       WHERE store_id = $2 AND user_id = $3 
       RETURNING *`,
      [parseInt(score, 10), storeId, userId]
    );

    res.json({ 
      message: 'Rating updated successfully', 
      rating: updatedRating.rows[0] 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while updating rating' });
  }
};

module.exports = { getAllStores, getMyStore, getStoreById, submitRating, updateRating };
