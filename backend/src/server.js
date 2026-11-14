const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const seedDatabase = require('./utils/seedData');
const chatSocket = require('./sockets/chatSocket');
const { Skill } = require('./models');

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

chatSocket(io);

// Start server after connecting to database
const startServer = async () => {
  try {
    const conn = await connectDB();
    if (conn) {
      // Check if seeding is needed
      const skillCount = await Skill.countDocuments();
      if (skillCount === 0) {
        console.log('[Server] Database is empty. Running initial seedData...');
        await seedDatabase();
      }
    }

    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` MentorMind AI Backend API running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` API Endpoint: http://localhost:${PORT}/api`);
      console.log(` WebSocket: ws://localhost:${PORT}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('[Server Error] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
