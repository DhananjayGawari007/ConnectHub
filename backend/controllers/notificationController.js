const { pool } = require('../config/database');
const { executeCppAction } = require('../services/cppBridge');

// Get all notifications for user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY priority DESC, created_at DESC LIMIT 50',
      [userId]
    );

    // Also get C++ Max Heap representation
    let heapData = null;
    try {
      heapData = await executeCppAction('heap_get');
    } catch (e) {}

    res.json({
      notifications,
      heapData
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ message: 'Error retrieving notifications' });
  }
};

// Create notification with priority (1-5)
const createNotification = async (req, res) => {
  try {
    const { userId, type, priority, content, referenceId, referenceType } = req.body;

    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, type, priority, content, reference_id, reference_type) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, type || 'general', priority || 1, content, referenceId || null, referenceType || null]
    );

    const notifId = result.insertId;

    // Active integration: Insert into C++ MaxHeap
    try {
      const timestamp = new Date().toISOString();
      await executeCppAction('heap_insert', [
        notifId,
        userId,
        priority || 1,
        type || 'general',
        content.replace(/"/g, "'"),
        timestamp
      ]);
    } catch (cppErr) {
      console.warn('C++ MaxHeap insert warning:', cppErr.message);
    }

    res.status(201).json({ message: 'Notification created', id: notifId });
  } catch (err) {
    res.status(500).json({ message: 'Error creating notification' });
  }
};

// Extract highest priority notification from C++ Max Heap
const extractHighestPriority = async (req, res) => {
  try {
    const result = await executeCppAction('heap_extract_max');
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error extracting highest priority notification', error: err.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [notificationId, userId]);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification' });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
};

// Get C++ Max Heap state
const getHeapState = async (req, res) => {
  try {
    const heapData = await executeCppAction('heap_get');
    res.json(heapData);
  } catch (err) {
    res.status(500).json({ message: 'Error getting heap state', error: err.message });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  extractHighestPriority,
  markAsRead,
  markAllAsRead,
  getHeapState
};
