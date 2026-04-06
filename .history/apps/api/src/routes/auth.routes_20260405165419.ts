import { Router } from "express";

const router = Router();

// Placeholder for auth routes
router.get("/x", (_req, res) => res.json({ message: "X auth not implemented" }));
router.get("/x/callback", (_req, res) => res.json({ message: "X callback not implemented" }));

export default router;