import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import draftRoutes from "./routes/draft.routes";
import postRoutes from "./routes/post.routes";
import analyticsRoutes from "./routes/analytics.routes";
import telegramRoutes from "./routes/telegram.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/drafts", draftRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/telegram", telegramRoutes);