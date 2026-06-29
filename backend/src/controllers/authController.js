const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { validateEmail, validatePassword, validateName, validateAddress } = require('../middleware/validateMiddleware');

// ─────────────────────────────────────────────────────────────────
// POST /api/auth/signup
// Public endpoint — registers a NORMAL_USER account
// ─────────────────────────────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Validate all fields
    const nameCheck = validateName(name);
    if (!nameCheck.valid) return res.status(400).json({ error: nameCheck.error });

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) return res.status(400).json({ error: emailCheck.error });

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) return res.status(400).json({ error: passwordCheck.error });

    const addressCheck = validateAddress(address);
    if (!addressCheck.valid) return res.status(400).json({ error: addressCheck.error });

    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Public signup always defaults to NORMAL_USER
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`,
      [name, email, password_hash, address, 'NORMAL_USER']
    );

    res.status(201).json({ 
      message: 'User created successfully', 
      user: newUser.rows[0] 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Public endpoint : authenticates any user, returns JWT
// ─────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = { signup, login };