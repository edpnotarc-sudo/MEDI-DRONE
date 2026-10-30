
import express from "express";
import cors from "cors";
import http from "node:http";
import { Server } from "socket.io";

import db from "./db.js";
import incidentRoutes from "./routes/incidents.js";

const app = express();
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Incident API routes
app.use("/api/incidents", incidentRoutes);

// Server port
const PORT = process.env.PORT || 5000;

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    application: "MEDI-DRONE",
    message: "Emergency assistance backend is running"
  });
});

// Get seeded hubs
app.get("/api/hubs", (req, res) => {
  try {
    const hubs = db.prepare("SELECT * FROM hubs").all();
    res.json(hubs);
  } catch (error) {
    console.error("Error fetching hubs:", error);
    res.status(500).json({ error: "Unable to fetch hubs" });
  }
});

// Get seeded drones
app.get("/api/drones", (req, res) => {
  try {
    const drones = db.prepare("SELECT * FROM drones").all();
    res.json(drones);
  } catch (error) {
    console.error("Error fetching drones:", error);
    res.status(500).json({ error: "Unable to fetch drones" });
  }
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("server:connected", {
    message: "Connected to MEDI-DRONE"
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start backend server
server.listen(PORT, "0.0.0.0", () => {
  console.log("--------------------------------");
  console.log("MEDI-DRONE BACKEND RUNNING");
  console.log(`http://localhost:${PORT}/api/health`);
  console.log("--------------------------------");
});
