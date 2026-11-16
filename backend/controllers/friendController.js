const { pool } = require('../config/database');
const { executeCppAction } = require('../services/cppBridge');

// Get accepted friends
const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const [friends] = await pool.query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.status, u.bio, f.created_at as friendship_date
       FROM friendships f
       JOIN users u ON (f.user_id_1 = u.id AND f.user_id_2 = ?) OR (f.user_id_2 = u.id AND f.user_id_1 = ?)
       WHERE u.id != ?
       ORDER BY u.status = 'online' DESC, u.username ASC`,
      [userId, userId, userId]
    );
    res.json({ friends });
  } catch (err) {
    console.error('getFriends error:', err);
    res.status(500).json({ message: 'Error retrieving friends' });
  }
};

// Send friend request
const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { targetUsername } = req.body;

    if (!targetUsername) {
      return res.status(400).json({ message: 'Target username is required' });
    }

    const [targets] = await pool.query('SELECT id, username FROM users WHERE username = ?', [targetUsername.trim()]);
    if (targets.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const receiverId = targets[0].id;
    if (senderId === receiverId) {
      return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
    }

    // Check if already friends
    const [alreadyFriends] = await pool.query(
      'SELECT id FROM friendships WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)',
      [senderId, receiverId, receiverId, senderId]
    );
    if (alreadyFriends.length > 0) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Insert friend request
    await pool.query(
      'INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, "pending") ON DUPLICATE KEY UPDATE status = "pending"',
      [senderId, receiverId]
    );

    // Create high-priority notification (priority 3: friend request)
    await pool.query(
      'INSERT INTO notifications (user_id, type, priority, content, reference_id, reference_type) VALUES (?, "friend_request", 3, ?, ?, "friend_request")',
      [receiverId, `${req.user.username} sent you a friend request`, senderId]
    );

    // Also insert into C++ MaxHeap
    try {
      await executeCppAction('heap_insert', [
        Date.now() % 100000,
        receiverId,
        3,
        'friend_request',
        `${req.user.username} sent you a friend request`.replace(/"/g, "'")
      ]);
    } catch (e) {}

    res.json({ message: 'Friend request sent successfully' });
  } catch (err) {
    console.error('sendFriendRequest error:', err);
    res.status(500).json({ message: 'Error sending friend request' });
  }
};

// Accept friend request
const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const [requests] = await pool.query(
      'SELECT * FROM friend_requests WHERE id = ? AND receiver_id = ? AND status = "pending"',
      [requestId, userId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    const reqData = requests[0];
    const u1 = Math.min(reqData.sender_id, reqData.receiver_id);
    const u2 = Math.max(reqData.sender_id, reqData.receiver_id);

    // Add friendship to MySQL
    await pool.query('INSERT IGNORE INTO friendships (user_id_1, user_id_2) VALUES (?, ?)', [u1, u2]);
    await pool.query('UPDATE friend_requests SET status = "accepted" WHERE id = ?', [requestId]);

    // Active integration: Add edge in C++ Graph!
    try {
      await executeCppAction('graph_add_friendship', [u1, u2]);
    } catch (cppErr) {
      console.warn('C++ Graph add edge warning:', cppErr.message);
    }

    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    console.error('acceptFriendRequest error:', err);
    res.status(500).json({ message: 'Error accepting friend request' });
  }
};

// Reject friend request
const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    await pool.query('UPDATE friend_requests SET status = "rejected" WHERE id = ? AND receiver_id = ?', [requestId, userId]);
    res.json({ message: 'Friend request rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting request' });
  }
};

// Remove friend
const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const u1 = Math.min(userId, friendId);
    const u2 = Math.max(userId, friendId);

    await pool.query('DELETE FROM friendships WHERE user_id_1 = ? AND user_id_2 = ?', [u1, u2]);

    // Active integration: Remove edge from C++ Graph!
    try {
      await executeCppAction('graph_remove_friendship', [u1, u2]);
    } catch (cppErr) {
      console.warn('C++ Graph remove edge warning:', cppErr.message);
    }

    res.json({ message: 'Friend removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing friend' });
  }
};

// Get pending friend requests
const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const [incoming] = await pool.query(
      `SELECT fr.id, fr.created_at, u.id as sender_id, u.username, u.display_name, u.avatar_url
       FROM friend_requests fr
       JOIN users u ON fr.sender_id = u.id
       WHERE fr.receiver_id = ? AND fr.status = 'pending'`,
      [userId]
    );

    const [outgoing] = await pool.query(
      `SELECT fr.id, fr.created_at, u.id as receiver_id, u.username, u.display_name, u.avatar_url
       FROM friend_requests fr
       JOIN users u ON fr.receiver_id = u.id
       WHERE fr.sender_id = ? AND fr.status = 'pending'`,
      [userId]
    );

    res.json({ incoming, outgoing });
  } catch (err) {
    res.status(500).json({ message: 'Error getting requests' });
  }
};

// C++ Graph Operations
const getGraphState = async (req, res) => {
  try {
    const graphData = await executeCppAction('graph_get');
    res.json(graphData);
  } catch (err) {
    res.status(500).json({ message: 'Error getting graph', error: err.message });
  }
};

const getBfsTraversal = async (req, res) => {
  try {
    const startId = req.params.userId || req.user.id;
    const result = await executeCppAction('graph_bfs', [startId]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error running BFS', error: err.message });
  }
};

const getDfsTraversal = async (req, res) => {
  try {
    const startId = req.params.userId || req.user.id;
    const result = await executeCppAction('graph_dfs', [startId]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error running DFS', error: err.message });
  }
};

const getMutualFriends = async (req, res) => {
  try {
    const u1 = req.user.id;
    const u2 = req.params.otherUserId;
    const result = await executeCppAction('graph_mutual', [u1, u2]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error running mutual friends', error: err.message });
  }
};

const getFriendSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await executeCppAction('graph_suggest', [userId]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error getting suggestions', error: err.message });
  }
};

module.exports = {
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getPendingRequests,
  getGraphState,
  getBfsTraversal,
  getDfsTraversal,
  getMutualFriends,
  getFriendSuggestions
};
