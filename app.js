import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import meetingRoutes from "./routes/meetingRoutes.js";
import handleSockets from "./socketHandlers/meetingSocket.js";

// Routes
import videoRoute from './routes/video.js';
import commentRoute from './routes/comments.js';
import userRoute from './routes/users.js';
// import videosRoute from './routes/videos.js';
// import tutorsRoute from './routes/tutors.js';
// import imagesRoute from './routes/images.js';
// import interactionsRoute from './routes/interactions.js';
// import connectionRoute from './routes/connection.js';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/userImage', express.static('userImage'));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/meetings', meetingRoutes);
app.use('/api/video', videoRoute);
app.use('/api', commentRoute);
app.use('/api/users', userRoute);
app.use('/api', videoRoute);

// app.use('/api/tutors', tutorsRoute);
// app.use('/api/images', imagesRoute);
// app.use('/api/interactions', interactionsRoute);
// app.use('/api/connection', connectionRoute);

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Server Nicely running!' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Something went wrong!';
  
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

// Handle Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
handleSockets(io);

// Server initialization
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create HTTP server
    const server = http.createServer(app);
    
    // Initialize Socket.IO
    const io = new Server(server);
    
    // Socket.IO connection handling
    io.on('connection', (socket) => {
      console.log('New client connected');
      
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    // Make io accessible to routes
    app.set('socketio', io);

    // Start HTTP server
    server.listen(HTTP_PORT, () => {
      console.log(`Server is running on port ${HTTP_PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
