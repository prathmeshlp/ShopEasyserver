import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
// import passport from "./config/passport";
import connectDB from "./config/db";
import logger from "./utils/logger";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";
import mongoose from "mongoose";

// Create Express app
const app: Express = express();

// Validate environment variables
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const CLIENT_URI = process.env.CLIENT_URI || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

if (!JWT_SECRET || !MONGO_URI) {
  logger.error("Missing required environment variables");
  process.exit(1);
}

// Middleware
app.use(
  cors({
    origin: CLIENT_URI,
    credentials: true, // Allow credentials for JWT
  })
);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  })
);
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(loggerMiddleware);

// Initialize passport (without sessions)
// app.use(passport.initialize());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Ecommerce2025 Server is running!");
});

app.use("/api", routes);

// Error handler
app.use(errorHandler);

// Connect to MongoDB
const startServer = async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await connectDB();
      logger.info("MongoDB connected");
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
      });
    } catch (err) {
      logger.error("Failed to connect to MongoDB", err);
      throw err;
    }
  }
};

startServer();
