import { Router } from "express";
import {
  createDraft,
  getDrafts,
  approveDraft,
  rejectDraft
} from "../controllers/draft.controller";

const router = Router();

router.get("/", getDrafts);
router.post("/", createDraft);
router.patch("/:id/approve", approveDraft);
router.patch("/:id/reject", rejectDraft);

export default router;