const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { executeCppAction } = require('../services/cppBridge');

const onlineUsers = new Map(); // userId -> Set of socketIds

function initializeSocket(io) {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'connecthub_jwt_super_secret_key_2024_cpp_ds'
      );

      const [rows] = await pool.query(
        'SELECT id, username, display_name, avatar_url, status FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (rows.length === 0) {
        return next(new Error('User not found'));
      }

      socket.user = rows[0];
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    console.log(`[Socket Connected] User ${socket.user.username} (ID: ${userId}) on socket ${socket.id}`);

    // Track online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Update status to online in database
    await pool.query('UPDATE users SET status = "online", last_seen = NOW() WHERE id = ?', [userId]);
    await pool.query('UPDATE user_status SET status = "online" WHERE user_id = ?', [userId]);

    // Broadcast online status
    io.emit('user_status_changed', { userId, status: 'online' });

    // Join personal user room for direct notifications and DMs
    socket.join(`user_${userId}`);

    // --- Channel Rooms ---
    socket.on('join_channel', (channelId) => {
      socket.join(`channel_${channelId}`);
    });

    socket.on('leave_channel', (channelId) => {
      socket.leave(`channel_${channelId}`);
    });

    // --- Channel Messaging ---
    socket.on('send_message', async (data, callback) => {
      try {
        const { channelId, content } = data;
        if (!channelId || !content || !content.trim()) return;

        // 1. MySQL insert
        const [result] = await pool.query(
          'INSERT INTO messages (channel_id, sender_id, content) VALUES (?, ?, ?)',
          [channelId, userId, content.trim()]
        );
        const messageId = result.insertId;

        const messageData = {
          id: messageId,
          channel_id: parseInt(channelId),
          sender_id: userId,
          username: socket.user.username,
          display_name: socket.user.display_name,
          avatar_url: socket.user.avatar_url,
          content: content.trim(),
          created_at: new Date().toISOString()
        };

        // 2. C++ FIFO Message Queue integration
        try {
          await executeCppAction('queue_enqueue', [
            messageId,
            userId,
            channelId,
            content.trim().replace(/"/g, "'"),
            messageData.created_at,
            (socket.user.display_name || socket.user.username).replace(/"/g, "'")
          ]);
        } catch (cppErr) {
          console.warn('[C++ MessageQueue Error]:', cppErr.message);
        }

        // 3. Broadcast to channel
        io.to(`channel_${channelId}`).emit('new_message', messageData);

        if (typeof callback === 'function') callback({ success: true, message: messageData });
      } catch (err) {
        console.error('Socket send_message error:', err);
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // --- Direct Messaging ---
    socket.on('send_direct_message', async (data, callback) => {
      try {
        const { receiverId, content } = data;
        if (!receiverId || !content || !content.trim()) return;

        const [result] = await pool.query(
          'INSERT INTO direct_messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
          [userId, receiverId, content.trim()]
        );
        const messageId = result.insertId;

        const dmData = {
          id: messageId,
          sender_id: userId,
          receiver_id: parseInt(receiverId),
          username: socket.user.username,
          display_name: socket.user.display_name,
          avatar_url: socket.user.avatar_url,
          content: content.trim(),
          created_at: new Date().toISOString()
        };

        // C++ FIFO Queue
        try {
          await executeCppAction('queue_enqueue', [
            messageId,
            userId,
            receiverId,
            content.trim().replace(/"/g, "'"),
            dmData.created_at,
            (socket.user.display_name || socket.user.username).replace(/"/g, "'")
          ]);
        } catch (e) {}

        // Emit to both sender and receiver rooms
        io.to(`user_${receiverId}`).emit('new_direct_message', dmData);
        io.to(`user_${userId}`).emit('new_direct_message', dmData);

        if (typeof callback === 'function') callback({ success: true, message: dmData });
      } catch (err) {
        console.error('Socket send_direct_message error:', err);
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // --- Typing Indicators ---
    socket.on('typing_start', ({ channelId }) => {
      socket.to(`channel_${channelId}`).emit('user_typing', {
        userId,
        username: socket.user.username,
        channelId
      });
    });

    socket.on('typing_stop', ({ channelId }) => {
      socket.to(`channel_${channelId}`).emit('user_stop_typing', {
        userId,
        channelId
      });
    });

    // --- Voice Channel WebRTC Signaling ---
    socket.on('voice_join', ({ channelId }) => {
      socket.join(`voice_${channelId}`);
      socket.to(`voice_${channelId}`).emit('voice_user_joined', {
        userId,
        username: socket.user.username,
        socketId: socket.id
      });
    });

    socket.on('voice_leave', ({ channelId }) => {
      socket.leave(`voice_${channelId}`);
      socket.to(`voice_${channelId}`).emit('voice_user_left', {
        userId,
        socketId: socket.id
      });
    });

    socket.on('voice_signal', ({ targetSocketId, signal }) => {
      io.to(targetSocketId).emit('voice_signal', {
        senderSocketId: socket.id,
        signal
      });
    });

    // --- Disconnect ---
    socket.on('disconnect', async () => {
      if (onlineUsers.has(userId)) {
        onlineUsers.get(userId).delete(socket.id);
        if (onlineUsers.get(userId).size === 0) {
          onlineUsers.delete(userId);
          // Mark offline in DB
          await pool.query('UPDATE users SET status = "offline", last_seen = NOW() WHERE id = ?', [userId]);
          await pool.query('UPDATE user_status SET status = "offline" WHERE user_id = ?', [userId]);
          io.emit('user_status_changed', { userId, status: 'offline' });
        }
      }
      console.log(`[Socket Disconnected] User ${socket.user.username} (ID: ${userId})`);
    });
  });
}

module.exports = { initializeSocket };
