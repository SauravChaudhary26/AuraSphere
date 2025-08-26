const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');

require("dotenv").config();

// Import routers
const AuthRouter = require("./routes/authRouter");
const MainRouter = require("./routes/mainRouter");
const cronRouter = require("./routes/cronRouter");

const JwtValidation = require("./middlewares/JwtValidation");

// Supress deprecation warnings
process.noDeprecation = true;

// Connect to the database
require("./db");

// Initialize the Express application and creating server
const app = express();
const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not set
const server = http.createServer(app);

// Middleware setup
// Add Cross-Origin-Opener-Policy header middleware
app.use((req, res, next) => {
   res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
   res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
   next();
});

// Enable CORS and parse JSON bodies
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get("/test", (req, res) => {
   res.send("SERVER IS RUNNING FINE");
});

// Define routes
app.use("/auth", AuthRouter);
app.use("/cron", cronRouter);
app.use("/", JwtValidation, MainRouter);

//Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// In-memory storage for rooms and users
const studyRooms = new Map();
const userTimers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join study room
  socket.on('join-study-room', (userData) => {
    const { roomId, user, studyDuration } = userData;
    
    // Join socket room
    socket.join(roomId);
    
    // Initialize room if doesn't exist
    if (!studyRooms.has(roomId)) {
      studyRooms.set(roomId, new Map());
    }
    
    // Add user to room
    const roomUsers = studyRooms.get(roomId);
    roomUsers.set(socket.id, {
      ...user,
      joinedAt: Date.now(),
      studyDuration: studyDuration * 60 * 1000, // Convert minutes to ms
      socketId: socket.id
    });
    
    // Set timer for auto-removal
    const timer = setTimeout(() => {
      handleStudyTimeEnd(socket, roomId);
    }, studyDuration * 60 * 1000);
    
    userTimers.set(socket.id, timer);
    
    // Broadcast updated user list to room
    io.to(roomId).emit('room-users-updated', Array.from(roomUsers.values()));
    
    socket.emit('joined-room-success', { roomId });
  });

  // Leave study room
  socket.on('leave-study-room', (roomId) => {
    leaveRoom(socket, roomId);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Find and leave all rooms user was in
    for (const [roomId, users] of studyRooms) {
      if (users.has(socket.id)) {
        leaveRoom(socket, roomId);
        break;
      }
    }
    
    // Clear timer
    if (userTimers.has(socket.id)) {
      clearTimeout(userTimers.get(socket.id));
      userTimers.delete(socket.id);
    }
  });
});

function handleStudyTimeEnd(socket, roomId) {
  // Remove user from room
  leaveRoom(socket, roomId);
  
  // Notify user that study time ended
  socket.emit('study-time-ended');
}

function leaveRoom(socket, roomId) {
  if (studyRooms.has(roomId)) {
    const roomUsers = studyRooms.get(roomId);
    roomUsers.delete(socket.id);
    
    // If room is empty, delete it
    if (roomUsers.size === 0) {
      studyRooms.delete(roomId);
    } else {
      // Broadcast updated user list
      io.to(roomId).emit('room-users-updated', Array.from(roomUsers.values()));
    }
  }
  
  socket.leave(roomId);
  
  // Clear timer
  if (userTimers.has(socket.id)) {
    clearTimeout(userTimers.get(socket.id));
    userTimers.delete(socket.id);
  }
}

// Start the server
server.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});