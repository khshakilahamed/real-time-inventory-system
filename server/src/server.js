import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import sequelize from "./sequelize/index.js";
import { initSocket } from "./socket/index.js";
import { startExpiryJob } from "./services/reservationExpiryJob.js";

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

console.log("✓ Socket.io server created");

// Make io available in Express route handlers via req.app.get('io')
app.set("io", io);

initSocket(io);

async function start() {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connected");

    if (process.env.DB_SYNC === "true") {
      await sequelize.sync({ alter: true });
      console.log("✓ Tables synced");
    } else {
      console.log("✓ Skipping table sync (DB_SYNC not set to true)");
    }

    startExpiryJob(io);
    server.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
