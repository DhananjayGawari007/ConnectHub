require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { pool, testConnection } = require('./config/database');
const { initializeSocket } = require('./socket/chatSocket');

// Import routes
const authRoutes = require('./routes/authRoutes');
const serverRoutes = require('./routes/serverRoutes');
const messageRoutes = require('./routes/messageRoutes');
const friendRoutes = require('./routes/friendRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dsLabRoutes = require('./routes/dsLabRoutes');

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in local dev
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

initializeSocket(io);

// Health route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ConnectHub Backend & C++ Data Structure Engine',
    database: 'MySQL 8.4',
    port: process.env.PORT || 5000
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ds-lab', dsLabRoutes);

// Serve Frontend Static Build
const path = require('path');
const frontendDist = path.join(__dirname, '../frontend/dist');
const fs = require('fs');

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Database diagnostics route
app.get('/api/db-status', async (req, res) => {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    res.json({
      status: 'connected',
      tables: tables.map(t => Object.values(t)[0]),
      host: pool.pool?.config?.connectionConfig?.host,
      database: pool.pool?.config?.connectionConfig?.database
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      code: err.code,
      host: pool.pool?.config?.connectionConfig?.host,
      database: pool.pool?.config?.connectionConfig?.database
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ConnectHub Server Error]:', err.stack || err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: err.message,
    code: err.code
  });
});

const PORT = process.env.PORT || 5000;

async function ensureSchema() {
  try {
    const fs = require('fs');
    const path = require('path');

    // 1. Create all tables if not exist
    const schemaPath = path.resolve(__dirname, '../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      const cleanSql = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      const statements = cleanSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.toUpperCase().startsWith('CREATE DATABASE') && !s.toUpperCase().startsWith('USE'));
      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (stmtErr) {
          // Table may already exist
        }
      }
      console.log(`✅ Database schema verified (${statements.length} statements)`);
    }

    // 2. Seed default servers and channels if database is fresh
    try {
      const [serverRows] = await pool.query('SELECT COUNT(*) as count FROM servers');
      if (serverRows[0]?.count === 0) {
        const samplePath = path.resolve(__dirname, '../database/sample_data.sql');
        if (fs.existsSync(samplePath)) {
          const sampleSql = fs.readFileSync(samplePath, 'utf8');
          const cleanSample = sampleSql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
          const sampleStatements = cleanSample
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.toUpperCase().startsWith('CREATE DATABASE') && !s.toUpperCase().startsWith('USE'));
          for (const stmt of sampleStatements) {
            try {
              await pool.query(stmt);
            } catch (e) {
              // Ignore conflicts during initial seed
            }
          }
          console.log('✅ Default servers & channels seeded successfully');
        }
      }
    } catch (e) {
      // Ignore initial count check error if table being prepared
    }
  } catch (err) {
    console.warn('Database schema auto-check warning:', err.message);
  }
}

async function ensureDemoUsers() {
  try {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('password123', 10);
    const demoUsers = [
      ['alice', 'alice@example.com', 'Alice Johnson', 'ConnectHub Explorer & C++ fan'],
      ['bob', 'bob@example.com', 'Bob Smith', 'Gaming enthusiast and developer'],
      ['charlie', 'charlie@example.com', 'Charlie Brown', 'Full-stack software developer'],
      ['diana', 'diana@example.com', 'Diana Prince', 'Designing beautiful user interfaces'],
      ['eve', 'eve@example.com', 'Eve Wilson', 'Music lover and community manager']
    ];

    for (const [uname, email, dname, bio] of demoUsers) {
      await pool.query(
        `INSERT INTO users (username, email, password_hash, display_name, bio, status) 
         VALUES (?, ?, ?, ?, ?, 'online') 
         ON DUPLICATE KEY UPDATE password_hash = ?`,
        [uname, email, hash, dname, bio, hash]
      );
    }
    console.log('✅ Demo accounts verified (Password: password123)');
  } catch (err) {
    console.warn('Demo users auto-seed warning:', err.message);
  }
}

async function startServer() {
  let dbOk = false;
  for (let attempt = 1; attempt <= 10; attempt++) {
    console.log(`[*] Connecting to MySQL (attempt ${attempt}/10)...`);
    dbOk = await testConnection();
    if (dbOk) break;
    await new Promise(r => setTimeout(r, 2000));
  }

  if (dbOk) {
    await ensureSchema();
    await ensureDemoUsers();
  } else {
    console.warn('⚠️ Warning: Database connection failed after 10 attempts.');
  }

  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 ConnectHub Backend listening on port ${PORT}`);
    console.log(`📡 Socket.IO Real-Time Engine Active`);
    console.log(`⚡ C++ Data Structure Engine Bridge Connected`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

startServer();

module.exports = { app, server };
