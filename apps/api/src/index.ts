import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { verifyTelegramWebAppData } from "./utils/crypto.js";

// Environment
dotenv.config();

// Prisma
const prisma = new PrismaClient();

// Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request context type extension
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

// Auth middleware for Mini App
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const initData = req.headers["x-init-data"];

  if (!authHeader || !initData) {
    return res.status(401).json({ success: false, error: "Missing auth headers" });
  }

  const verification = verifyTelegramWebAppData(
    initData as string,
    process.env.TELEGRAM_BOT_TOKEN!
  );

  if (!verification.valid || !verification.data?.user?.id) {
    return res.status(401).json({ success: false, error: "Invalid auth data" });
  }

  req.userId = String(verification.data.user.id);
  next();
};

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes will be imported here
// TODO: Import routes
// import telegramRoutes from "./routes/telegram.js";
// import draftsRoutes from "./routes/drafts.js";
// import postsRoutes from "./routes/posts.js";
// import analyticsRoutes from "./routes/analytics.js";
// import xAuthRoutes from "./routes/x-auth.js";

// app.use("/telegram", telegramRoutes);
// app.use("/api/drafts", authMiddleware, draftsRoutes);
// app.use("/api/posts", authMiddleware, postsRoutes);
// app.use("/api/analytics", authMiddleware, analyticsRoutes);
// app.use("/api/x-auth", xAuthRoutes);

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Not found" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

export default app;
export { prisma };
