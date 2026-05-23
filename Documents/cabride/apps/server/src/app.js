import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { ENV } from "./config/env.js";
import router from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

// ── Security & parsing ────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [ENV.CUSTOMER_URL, ENV.DRIVER_URL],
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ── Logging (skip in test) ────────────────────────────
if (ENV.NODE_ENV !== "test") {
  app.use(morgan(ENV.IS_PROD ? "combined" : "dev"));
}

// ── API routes ────────────────────────────────────────
app.use("/api/v1", router);

// ── Error handling (must be last) ────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
