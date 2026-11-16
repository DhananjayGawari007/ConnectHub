const { pool } = require('../config/database');
const { executeCppAction } = require('../services/cppBridge');
const crypto = require('crypto');

// Get all servers user is a member of
const getUserServers = async (req, res) => {
  try {
    const userId = req.user.id;
    const [servers] = await pool.query(
      `SELECT s.*, sm.role, 
        (SELECT COUNT(*) FROM server_members WHERE server_id = s.id) as member_count
       FROM servers s
       JOIN server_members sm ON s.id = sm.server_id
       WHERE sm.user_id = ?
       ORDER BY s.created_at DESC`,
      [userId]
    );
    res.json({ servers });
  } catch (err) {
    console.error('getUserServers error:', err);
    res.status(500).json({ message: 'Error retrieving servers' });
  }
};

// Create a server
const createServer = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Server name is required' });
    }

    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // 1. Add server root to C++ N-ary Tree
    let treeNodeId = null;
    try {
      const cppResult = await executeCppAction('tree_add_server', [name.trim()]);
      treeNodeId = cppResult.id;
    } catch (cppErr) {
      console.warn('C++ NaryTree add_server error:', cppErr.message);
    }

    // 2. Insert into MySQL servers table
    const [serverResult] = await pool.query(
      'INSERT INTO servers (name, description, owner_id, invite_code, tree_node_id) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), description || '', userId, inviteCode, treeNodeId]
    );
    const serverId = serverResult.insertId;

    // 3. Add owner as member
    await pool.query(
      'INSERT INTO server_members (server_id, user_id, role) VALUES (?, ?, "owner")',
      [serverId, userId]
    );

    // 4. Create default categories & channels both in C++ N-ary Tree and MySQL
    let generalCatNodeId = null;
    let voiceCatNodeId = null;

    if (treeNodeId) {
      try {
        const catRes1 = await executeCppAction('tree_add_category', [treeNodeId, 'Text Channels']);
        generalCatNodeId = catRes1.id;
        const catRes2 = await executeCppAction('tree_add_category', [treeNodeId, 'Voice Channels']);
        voiceCatNodeId = catRes2.id;
      } catch (e) {
        console.warn('Error creating C++ categories:', e.message);
      }
    }

    const [cat1] = await pool.query(
      'INSERT INTO categories (server_id, name, position, tree_node_id) VALUES (?, "Text Channels", 0, ?)',
      [serverId, generalCatNodeId]
    );
    const [cat2] = await pool.query(
      'INSERT INTO categories (server_id, name, position, tree_node_id) VALUES (?, "Voice Channels", 1, ?)',
      [serverId, voiceCatNodeId]
    );

    // Default channels
    let chGenNodeId = null;
    let chVoiceNodeId = null;
    if (generalCatNodeId) {
      try {
        const ch1 = await executeCppAction('tree_add_channel', [generalCatNodeId, 'general', 'text']);
        chGenNodeId = ch1.id;
      } catch (e) {}
    }
    if (voiceCatNodeId) {
      try {
        const ch2 = await executeCppAction('tree_add_channel', [voiceCatNodeId, 'Lounge', 'voice']);
        chVoiceNodeId = ch2.id;
      } catch (e) {}
    }

    await pool.query(
      'INSERT INTO channels (category_id, server_id, name, type, tree_node_id) VALUES (?, ?, "general", "text", ?)',
      [cat1.insertId, serverId, chGenNodeId]
    );
    await pool.query(
      'INSERT INTO channels (category_id, server_id, name, type, tree_node_id) VALUES (?, ?, "Lounge", "voice", ?)',
      [cat2.insertId, serverId, chVoiceNodeId]
    );

    res.status(201).json({
      message: 'Server created successfully',
      server: {
        id: serverId,
        name,
        description,
        inviteCode,
        treeNodeId
      }
    });
  } catch (err) {
    console.error('createServer error:', err);
    res.status(500).json({ message: 'Error creating server' });
  }
};

// Get server hierarchy (categories & channels)
const getServerHierarchy = async (req, res) => {
  try {
    const { serverId } = req.params;

    const [serverRows] = await pool.query('SELECT * FROM servers WHERE id = ?', [serverId]);
    if (serverRows.length === 0) {
      return res.status(404).json({ message: 'Server not found' });
    }

    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE server_id = ? ORDER BY position ASC, id ASC',
      [serverId]
    );

    const [channels] = await pool.query(
      'SELECT * FROM channels WHERE server_id = ? ORDER BY position ASC, id ASC',
      [serverId]
    );

    // Get live C++ N-ary Tree representation
    let cppTree = null;
    try {
      cppTree = await executeCppAction('tree_get');
    } catch (e) {
      console.warn('Failed to fetch live C++ tree:', e.message);
    }

    // Nest channels under categories
    const categoryMap = categories.map(cat => ({
      ...cat,
      channels: channels.filter(ch => ch.category_id === cat.id)
    }));

    res.json({
      server: serverRows[0],
      hierarchy: categoryMap,
      cppTreeStructure: cppTree
    });
  } catch (err) {
    console.error('getServerHierarchy error:', err);
    res.status(500).json({ message: 'Error retrieving hierarchy' });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const { serverId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const [serverRows] = await pool.query('SELECT tree_node_id FROM servers WHERE id = ?', [serverId]);
    if (serverRows.length === 0) {
      return res.status(404).json({ message: 'Server not found' });
    }

    let treeNodeId = null;
    if (serverRows[0].tree_node_id) {
      try {
        const cppRes = await executeCppAction('tree_add_category', [serverRows[0].tree_node_id, name.trim()]);
        treeNodeId = cppRes.id;
      } catch (e) {
        console.warn('C++ add category failed:', e.message);
      }
    }

    const [result] = await pool.query(
      'INSERT INTO categories (server_id, name, tree_node_id) VALUES (?, ?, ?)',
      [serverId, name.trim(), treeNodeId]
    );

    res.status(201).json({
      message: 'Category created',
      category: {
        id: result.insertId,
        serverId,
        name: name.trim(),
        treeNodeId
      }
    });
  } catch (err) {
    console.error('createCategory error:', err);
    res.status(500).json({ message: 'Error creating category' });
  }
};

// Create channel
const createChannel = async (req, res) => {
  try {
    const { serverId } = req.params;
    const { categoryId, name, type, topic } = req.body;

    if (!categoryId || !name || !name.trim()) {
      return res.status(400).json({ message: 'Category ID and channel name are required' });
    }

    const [catRows] = await pool.query('SELECT tree_node_id FROM categories WHERE id = ?', [categoryId]);
    let treeNodeId = null;
    if (catRows.length > 0 && catRows[0].tree_node_id) {
      try {
        const cppRes = await executeCppAction('tree_add_channel', [
          catRows[0].tree_node_id,
          name.trim(),
          type === 'voice' ? 'voice' : 'text'
        ]);
        treeNodeId = cppRes.id;
      } catch (e) {
        console.warn('C++ add channel failed:', e.message);
      }
    }

    const [result] = await pool.query(
      'INSERT INTO channels (category_id, server_id, name, type, topic, tree_node_id) VALUES (?, ?, ?, ?, ?, ?)',
      [categoryId, serverId, name.trim(), type === 'voice' ? 'voice' : 'text', topic || '', treeNodeId]
    );

    res.status(201).json({
      message: 'Channel created',
      channel: {
        id: result.insertId,
        categoryId,
        serverId,
        name: name.trim(),
        type: type === 'voice' ? 'voice' : 'text',
        treeNodeId
      }
    });
  } catch (err) {
    console.error('createChannel error:', err);
    res.status(500).json({ message: 'Error creating channel' });
  }
};

// Move channel between categories (C++ N-ary Tree operation)
const moveChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { newCategoryId } = req.body;

    const [chRows] = await pool.query('SELECT * FROM channels WHERE id = ?', [channelId]);
    const [catRows] = await pool.query('SELECT * FROM categories WHERE id = ?', [newCategoryId]);

    if (chRows.length === 0 || catRows.length === 0) {
      return res.status(404).json({ message: 'Channel or category not found' });
    }

    // Call C++ move operation
    if (chRows[0].tree_node_id && catRows[0].tree_node_id) {
      try {
        await executeCppAction('tree_move_channel', [chRows[0].tree_node_id, catRows[0].tree_node_id]);
      } catch (e) {
        console.warn('C++ move channel warning:', e.message);
      }
    }

    // Update in MySQL
    await pool.query('UPDATE channels SET category_id = ? WHERE id = ?', [newCategoryId, channelId]);

    res.json({ message: 'Channel moved successfully' });
  } catch (err) {
    console.error('moveChannel error:', err);
    res.status(500).json({ message: 'Error moving channel' });
  }
};

// Delete channel (updates C++ Tree and MySQL)
const deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const [chRows] = await pool.query('SELECT tree_node_id FROM channels WHERE id = ?', [channelId]);
    if (chRows.length > 0 && chRows[0].tree_node_id) {
      try {
        await executeCppAction('tree_delete_node', [chRows[0].tree_node_id]);
      } catch (e) {}
    }
    await pool.query('DELETE FROM channels WHERE id = ?', [channelId]);
    res.json({ message: 'Channel deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting channel' });
  }
};

// Get server members
const getServerMembers = async (req, res) => {
  try {
    const { serverId } = req.params;
    const [members] = await pool.query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.status, sm.role, sm.nickname, sm.joined_at
       FROM server_members sm
       JOIN users u ON sm.user_id = u.id
       WHERE sm.server_id = ?
       ORDER BY sm.role = 'owner' DESC, sm.role = 'admin' DESC, u.status = 'online' DESC, u.username ASC`,
      [serverId]
    );
    res.json({ members });
  } catch (err) {
    console.error('getServerMembers error:', err);
    res.status(500).json({ message: 'Error retrieving members' });
  }
};

// Join server via invite code
const joinServer = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user.id;

    const [servers] = await pool.query('SELECT * FROM servers WHERE invite_code = ?', [inviteCode.trim()]);
    if (servers.length === 0) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    const server = servers[0];
    await pool.query(
      'INSERT INTO server_members (server_id, user_id, role) VALUES (?, ?, "member") ON DUPLICATE KEY UPDATE role = role',
      [server.id, userId]
    );

    res.json({ message: 'Joined server successfully', server });
  } catch (err) {
    console.error('joinServer error:', err);
    res.status(500).json({ message: 'Error joining server' });
  }
};

module.exports = {
  getUserServers,
  createServer,
  getServerHierarchy,
  createCategory,
  createChannel,
  moveChannel,
  deleteChannel,
  getServerMembers,
  joinServer
};
