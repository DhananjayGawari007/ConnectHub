const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { executeCppAction } = require('../services/cppBridge');

const register = async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username.toLowerCase().trim(), email.toLowerCase().trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, display_name, status) VALUES (?, ?, ?, ?, ?)',
      [username.toLowerCase().trim(), email.toLowerCase().trim(), passwordHash, displayName || username, 'online']
    );

    const userId = result.insertId;

    await pool.query(
      'INSERT INTO user_status (user_id, status) VALUES (?, ?) ON DUPLICATE KEY UPDATE status = ?',
      [userId, 'online', 'online']
    );

    try {
      await executeCppAction('graph_add_user', [userId, username.toLowerCase().trim()]);
    } catch (cppErr) {
      console.warn('C++ Graph sync warning:', cppErr.message);
    }

    const token = jwt.sign(
      { userId, username },
      process.env.JWT_SECRET || 'connecthub_jwt_super_secret_key_2024_cpp_ds',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        username,
        email,
        displayName: displayName || username,
        status: 'online'
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message || 'Registration failed', error: err.message, code: err.code });
  }
};

const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Email/username and password are required' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [emailOrUsername.toLowerCase().trim(), emailOrUsername.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await pool.query('UPDATE users SET status = "online", last_seen = NOW() WHERE id = ?', [user.id]);
    await pool.query(
      'INSERT INTO user_status (user_id, status) VALUES (?, "online") ON DUPLICATE KEY UPDATE status = "online"',
      [user.id]
    );

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'connecthub_jwt_super_secret_key_2024_cpp_ds',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        status: 'online'
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message || 'Login failed', error: err.message, code: err.code });
  }
};

const getMe = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM server_members WHERE user_id = ?) as server_count,
        (SELECT COUNT(*) FROM friendships WHERE user_id_1 = ? OR user_id_2 = ?) as friend_count
    `, [req.user.id, req.user.id, req.user.id]);

    const [statusRow] = await pool.query('SELECT custom_status FROM user_status WHERE user_id = ?', [req.user.id]);

    res.json({
      user: {
        ...req.user,
        customStatus: statusRow[0]?.custom_status || '',
        serverCount: stats[0]?.server_count || 0,
        friendCount: stats[0]?.friend_count || 0
      }
    });
  } catch (err) {
    res.json({ user: req.user });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { displayName, bio, status, customStatus, avatarUrl } = req.body;

    const updates = [];
    const params = [];

    if (displayName !== undefined) {
      updates.push('display_name = ?');
      params.push(displayName.trim());
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      params.push(bio.trim());
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      params.push(avatarUrl);
    }

    if (updates.length > 0) {
      params.push(userId);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    if (status !== undefined || customStatus !== undefined) {
      await pool.query(
        `INSERT INTO user_status (user_id, status, custom_status) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE status = COALESCE(?, status), custom_status = COALESCE(?, custom_status)`,
        [userId, status || 'online', customStatus || '', status, customStatus]
      );
    }

    const [rows] = await pool.query(
      'SELECT id, username, email, display_name, avatar_url, bio, status FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        ...rows[0],
        customStatus: customStatus || ''
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

const logout = async (req, res) => {
  try {
    if (req.user && req.user.id) {
      await pool.query('UPDATE users SET status = "offline", last_seen = NOW() WHERE id = ?', [req.user.id]);
      await pool.query('UPDATE user_status SET status = "offline" WHERE user_id = ?', [req.user.id]);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error logging out' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  logout
};
