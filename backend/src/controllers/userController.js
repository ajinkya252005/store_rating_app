const pool = require('../db');
const bcrypt = require('bcrypt');
const { validatePassword } = require('../middleware/validateMiddleware');

// ─────────────────────────────────────────────────────────────────
// GET /api/users/me
// Any authenticated user.
// Returns the logged-in user's own profile.
// ─────────────────────────────────────────────────────────────────
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUT /api/users/me/password
// Any authenticated user (NORMAL_USER or STORE_OWNER).
// Updates the logged-in user's password.
// Body: { currentPassword, newPassword }
// ─────────────────────────────────────────────────────────────────
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required.' });
    }

    // Validate new password against rules
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) return res.status(400).json({ error: passwordCheck.error });

    // Fetch the user to get their stored hash
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password_hash } = userResult.rows[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Ensure new password is different from current
    const isSame = await bcrypt.compare(newPassword, password_hash);
    if (isSame) {
      return res.status(400).json({ error: 'New password must be different from the current password.' });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while updating password' });
  }
};

module.exports = { getMyProfile, updatePassword };
