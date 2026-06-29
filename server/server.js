const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow servers/mobile/postman requests
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

// Configure Socket.IO with restricted CORS
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Bind socket io to app instance so controllers can access it
app.set('io', io);

// Database Connection
connectDB().then(() => {
  // Auto-seed Admin user if it doesn't exist
  seedAdmin();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const matchRoutes = require('./routes/matchRoutes');
const responseRoutes = require('./routes/responseRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/responses', responseRoutes);

// Simple Status Endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Weekend XI API is running smoothly' });
});

// Seed admin function
const seedAdmin = async () => {
  try {
    const User = require('./models/user');
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const adminName = process.env.ADMIN_NAME || 'Admin';
      const admin = new User({
        name: adminName,
        roomNumber: '000',
        role: 'admin'
      });
      await admin.save();
      console.log(`[SEED] Admin user '${adminName}' successfully initialized.`);
    } else {
      console.log('[SEED] Admin user already exists. Skipping initialization.');
    }
  } catch (error) {
    console.error('[SEED] Error seeding admin user:', error);
  }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[SOCKET] User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[SOCKET] User disconnected: ${socket.id}`);
  });
});

// Server Port Configuration
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Weekend XI server running in development mode on port ${PORT}`);
});
