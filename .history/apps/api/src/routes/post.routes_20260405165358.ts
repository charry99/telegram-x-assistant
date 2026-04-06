import { Router } from "express";
import { publishApprovedDraft } from "../controllers/post.controller";

const router = Router();

router.post("/publish/:draftId", publishApprovedDraft);

export default router;