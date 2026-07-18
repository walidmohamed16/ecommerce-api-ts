import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io'; 

import app from './app';
import connectDB from './config/db';

// Connect to Database
connectDB();

const server = http.createServer(app);

// bnorbodo bl frontend
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

// ba listen 3la ay connection mn ay uer
io.on('connection', (socket) => {
  console.log(`User connected to WebSocket: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log('User disconnected from WebSocket');
  });
});

const PORT: number = Number(process.env.PORT) || 5000;
// bnshaghal el server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});