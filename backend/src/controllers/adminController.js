const pool = require('../db');
const bcrypt = require('bcrypt');
const { validateEmail, validatePassword, validateName, validateAddress } = require('../middleware/validateMiddleware');

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard
// Returns aggregate counts: totalUsers, totalStores, totalRatings
// ─────────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [usersResult, storesResult, ratingsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM stores'),
      pool.query('SELECT COUNT(*) FROM ratings'),
    ]);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count, 10),
      totalStores: parseInt(storesResult.rows[0].count, 10),
      totalRatings: parseInt(ratingsResult.rows[0].count, 10),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching dashboard stats' });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/users
// Returns all users with optional filtering and sorting.
// Query params: name, email, address, role, sort, order
// ─────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { name, email, address, role, sort, order } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const allowedOrders = ['asc', 'desc'];

    const sortField = allowedSortFields.includes(sort) ? sort : 'name';
    const sortOrder = allowedOrders.includes(order?.toLowerCase()) ? order.toLowerCase() : 'asc';

    const conditions = [];
    const values = [];
    let idx = 1;

    if (name) {
      conditions.push(`LOWER(name) LIKE $${idx++}`);
      values.push(`%${name.toLowerCase()}%`);
    }
    if (email) {
      conditions.push(`LOWER(email) LIKE $${idx++}`);
      values.push(`%${email.toLowerCase()}%`);
    }
    if (address) {
      conditions.push(`LOWER(address) LIKE $${idx++}`);
      values.push(`%${address.toLowerCase()}%`);
    }
    if (role) {
      conditions.push(`role = $${idx++}`);
      values.push(role.toUpperCase());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT id, name, email, address, role, created_at
      FROM users
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/admin/users
// Admin creates a user with any role.
// ─────────────────────────────────────────────────────────────────
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Validate inputs
    const nameCheck = validateName(name);
    if (!nameCheck.valid) return res.status(400).json({ error: nameCheck.error });

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) return res.status(400).json({ error: emailCheck.error });

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) return res.status(400).json({ error: passwordCheck.error });

    const addressCheck = validateAddress(address);
    if (!addressCheck.valid) return res.status(400).json({ error: addressCheck.error });

    const validRoles = ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role provided.' });
    }

    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`,
      [name, email, password_hash, address, role]
    );

    res.status(201).json({ 
      message: `${role} created successfully`, 
      user: newUser.rows[0] 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while creating user' });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/stores
// Admin view: all stores with average rating and owner info.
// Query params: name, email, address, sort, order
// ─────────────────────────────────────────────────────────────────
const adminGetAllStores = async (req, res) => {
  try {
    const { name, email, address, sort, order } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'average_rating', 'created_at'];
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
    if (email) {
      conditions.push(`LOWER(s.email) LIKE $${idx++}`);
      values.push(`%${email.toLowerCase()}%`);
    }
    if (address) {
      conditions.push(`LOWER(s.address) LIKE $${idx++}`);
      values.push(`%${address.toLowerCase()}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        u.name AS owner_name,
        u.email AS owner_email,
        ROUND(AVG(r.score), 2) AS average_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereClause}
      GROUP BY s.id, u.name, u.email
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
// POST /api/admin/stores
// Admin creates a store assigned to an existing STORE_OWNER user.
// ─────────────────────────────────────────────────────────────────
const createStore = async (req, res) => {
  try {
    const { owner_id, name, email, address } = req.body;

    if (!owner_id) return res.status(400).json({ error: 'owner_id is required.' });
    if (!name || name.trim() === '') return res.status(400).json({ error: 'Store name is required.' });

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) return res.status(400).json({ error: emailCheck.error });

    const addressCheck = validateAddress(address);
    if (!addressCheck.valid) return res.status(400).json({ error: addressCheck.error });

    const ownerCheck = await pool.query('SELECT role FROM users WHERE id = $1', [owner_id]);
    
    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (ownerCheck.rows[0].role !== 'STORE_OWNER') {
      return res.status(400).json({ error: 'The assigned user must have the STORE_OWNER role.' });
    }

    const newStore = await pool.query(
      `INSERT INTO stores (owner_id, name, email, address) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [owner_id, name, email, address]
    );

    res.status(201).json({ 
      message: 'Store created successfully', 
      store: newStore.rows[0] 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while creating store' });
  }
};

module.exports = { getDashboardStats, getAllUsers, createUser, adminGetAllStores, createStore };