const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'connecthub_jwt_super_secret_key_2024_cpp_ds');

    const [rows] = await pool.query(
      'SELECT id, username, email, display_name, avatar_url, bio, status FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
