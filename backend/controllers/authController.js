// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');
const { validateRegister, validateLogin } = require('../middleware/validate');

// Helper: generate JWT
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ─── REGISTER ───────────────────────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password, full_name } = req.body;

    // Validate input
    const errors = validateRegister({ username, email, password, full_name });
    if (errors.length) return res.status(400).json({ success: false, errors });

    // Check duplicate username
    const [existingUsername] = await pool.query(
      'SELECT id FROM users WHERE username = ?',
      [username.toLowerCase()]
    );
    if (existingUsername.length) {
      return res.status(409).json({ success: false, message: `Username "@${username}" is already taken. Please choose a different one.` });
    }

    // Check duplicate email
    const [existingEmail] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    if (existingEmail.length) {
      return res.status(409).json({ success: false, message: 'This email is already registered. Try logging in instead.' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
      [username.toLowerCase(), email.toLowerCase(), hashed, full_name || '']
    );

    const token = signToken(result.insertId);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: result.insertId,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        full_name: full_name || '',
        avatar: 'default-avatar.png',
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── LOGIN ───────────────────────────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const errors = validateLogin({ email, password });
    if (errors.length) return res.status(400).json({ success: false, errors });

    // Find user
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user.id);

    // Don't send password back
    delete user.password;

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET CURRENT USER ────────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe };
