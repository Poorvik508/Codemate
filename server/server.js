import 'dotenv/config';
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import connnectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";

import chatbotRoute from "./routes/chatbotRoutes.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import profileRoutes from "./routes/profileRoutes.js"
import fileUpload from 'express-fileupload';

const app = express();
const port = process.env.PORT || 4000;

connnectDB();

const allowedOrigins = ["http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(fileUpload({
    useTempFiles: true, // This is needed for Cloudinary uploads
    tempFileDir: '/tmp/' // Directory to store temporary files
}));



// API endpoints
app.get("/", (req, res) => {
  res.send("API Working fine");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/profile", profileRoutes);
app.use("/api/chatbot", chatbotRoute );

// --- Socket.IO Setup ---
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // Join conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation ${conversationId}`);
  });

  // Send message
  socket.on("send_message", (message) => {
    io.to(message.conversationId).emit("receive_message", message);
  });

  // Typing indicator
  socket.on("typing", (conversationId) => {
    socket.to(conversationId).emit("user_typing");
  });

  socket.on("stop_typing", (conversationId) => {
    socket.to(conversationId).emit("user_stop_typing");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`🚀 Server started on port: ${port}`);
});
