const { pool } = require('../config/database');
const { executeCppAction } = require('../services/cppBridge');

// Send message to channel
const sendChannelMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;
    const senderName = req.user.display_name || req.user.username;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // 1. Insert into MySQL messages
    const [result] = await pool.query(
      'INSERT INTO messages (channel_id, sender_id, content) VALUES (?, ?, ?)',
      [channelId, senderId, content.trim()]
    );
    const messageId = result.insertId;

    const [rows] = await pool.query(
      `SELECT m.*, u.username, u.display_name, u.avatar_url 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.id = ?`,
      [messageId]
    );

    const savedMessage = rows[0];

    // 2. Enqueue into C++ MessageQueue (FIFO)
    try {
      const timestamp = new Date().toISOString();
      await executeCppAction('queue_enqueue', [
        messageId,
        senderId,
        channelId,
        content.trim().replace(/"/g, "'"),
        timestamp,
        senderName.replace(/"/g, "'")
      ]);
    } catch (cppErr) {
      console.warn('C++ Queue enqueue warning:', cppErr.message);
    }

    res.status(201).json({ message: savedMessage });
  } catch (err) {
    console.error('sendChannelMessage error:', err);
    res.status(500).json({ message: 'Error sending message' });
  }
};

// Get messages for a channel
const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const [messages] = await pool.query(
      `SELECT m.*, u.username, u.display_name, u.avatar_url 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.channel_id = ? 
       ORDER BY m.created_at ASC 
       LIMIT ?`,
      [channelId, limit]
    );

    res.json({ messages });
  } catch (err) {
    console.error('getChannelMessages error:', err);
    res.status(500).json({ message: 'Error retrieving messages' });
  }
};

// Send Direct Message
const sendDirectMessage = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;
    const senderName = req.user.display_name || req.user.username;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO direct_messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [senderId, receiverId, content.trim()]
    );
    const messageId = result.insertId;

    // Enqueue into C++ Message Queue
    try {
      const timestamp = new Date().toISOString();
      await executeCppAction('queue_enqueue', [
        messageId,
        senderId,
        receiverId,
        content.trim().replace(/"/g, "'"),
        timestamp,
        senderName.replace(/"/g, "'")
      ]);
    } catch (e) {}

    const [rows] = await pool.query(
      `SELECT dm.*, u.username, u.display_name, u.avatar_url 
       FROM direct_messages dm 
       JOIN users u ON dm.sender_id = u.id 
       WHERE dm.id = ?`,
      [messageId]
    );

    res.status(201).json({ message: rows[0] });
  } catch (err) {
    console.error('sendDirectMessage error:', err);
    res.status(500).json({ message: 'Error sending direct message' });
  }
};

// Get conversation between two users
const getDirectMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    const [messages] = await pool.query(
      `SELECT dm.*, u.username, u.display_name, u.avatar_url 
       FROM direct_messages dm 
       JOIN users u ON dm.sender_id = u.id 
       WHERE (dm.sender_id = ? AND dm.receiver_id = ?) 
          OR (dm.sender_id = ? AND dm.receiver_id = ?) 
       ORDER BY dm.created_at ASC`,
      [userId, otherUserId, otherUserId, userId]
    );

    res.json({ messages });
  } catch (err) {
    console.error('getDirectMessages error:', err);
    res.status(500).json({ message: 'Error retrieving direct messages' });
  }
};

// Edit message
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    await pool.query(
      'UPDATE messages SET content = ?, edited = TRUE WHERE id = ? AND sender_id = ?',
      [content.trim(), messageId, userId]
    );

    res.json({ message: 'Message updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error editing message' });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    await pool.query('DELETE FROM messages WHERE id = ? AND sender_id = ?', [messageId, userId]);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting message' });
  }
};

// Get C++ Message Queue state
const getQueueState = async (req, res) => {
  try {
    const queueData = await executeCppAction('queue_get');
    res.json(queueData);
  } catch (err) {
    res.status(500).json({ message: 'Error getting C++ queue state', error: err.message });
  }
};

// Process / Dequeue next message in C++ queue
const processNextMessage = async (req, res) => {
  try {
    const result = await executeCppAction('queue_dequeue');
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error dequeuing', error: err.message });
  }
};

module.exports = {
  sendChannelMessage,
  getChannelMessages,
  sendDirectMessage,
  getDirectMessages,
  editMessage,
  deleteMessage,
  getQueueState,
  processNextMessage
};
