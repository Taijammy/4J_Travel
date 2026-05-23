import "dotenv/config";
import http from "http";
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { initSocket } from "./sockets/index.js";
import { ENV } from "./config/env.js";

const httpServer = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = initSocket(httpServer);

// Make io accessible in controllers if needed
app.set("io", io);

const start = async () => {
  await connectDB();

  httpServer.listen(ENV.PORT, () => {
    console.log("─────────────────────────────────────");
    console.log(`🚀 Server running on port ${ENV.PORT}`);
    console.log(`📡 Environment: ${ENV.NODE_ENV}`);
    console.log(`🔗 API: http://localhost:${ENV.PORT}/api/v1`);
    console.log(`❤️  Health: http://localhost:${ENV.PORT}/api/v1/health`);
    console.log("─────────────────────────────────────");
  });
};

start();

// ── Graceful shutdown ─────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  await disconnectDB();
  httpServer.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// Catch unhandled errors — log but don't crash silently
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  shutdown("unhandledRejection");
});
