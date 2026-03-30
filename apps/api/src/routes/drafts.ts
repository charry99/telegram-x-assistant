import express, { Request, Response } from "express";
import { prisma } from "../index.js";

const router = express.Router();

// GET /api/drafts - Get user's drafts
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { status, limit = "20", offset = "0" } = req.query;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const drafts = await prisma.draft.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.draft.count({ where });

    res.json({
      success: true,
      data: drafts,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    console.error("Error fetching drafts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/drafts/:id - Get single draft
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const draft = await prisma.draft.findUnique({
      where: { id },
    });

    if (!draft || draft.userId !== userId) {
      return res.status(404).json({ success: false, error: "Draft not found" });
    }

    res.json({ success: true, data: draft });
  } catch (error: any) {
    console.error("Error fetching draft:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/drafts - Create new draft
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { sourceType, sourceRef, draftText, tone } = req.body;

    if (!draftText) {
      return res.status(400).json({ success: false, error: "Draft text is required" });
    }

    const draft = await prisma.draft.create({
      data: {
        userId,
        sourceType: sourceType || "post",
        sourceRef,
        draftText,
        tone,
        status: "pending",
      },
    });

    res.status(201).json({ success: true, data: draft });
  } catch (error: any) {
    console.error("Error creating draft:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/drafts/:id - Update draft
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { draftText, tone, status } = req.body;

    const draft = await prisma.draft.findUnique({
      where: { id },
    });

    if (!draft || draft.userId !== userId) {
      return res.status(404).json({ success: false, error: "Draft not found" });
    }

    // Only allow status change if approving/rejecting
    if (status && !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const updatedDraft = await prisma.draft.update({
      where: { id },
      data: {
        ...(draftText && { draftText }),
        ...(tone && { tone }),
        ...(status === "approved" && { status, approvedAt: new Date() }),
        ...(status === "rejected" && { status }),
      },
    });

    res.json({ success: true, data: updatedDraft });
  } catch (error: any) {
    console.error("Error updating draft:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/drafts/:id/approve - Approve draft
router.post("/:id/approve", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const draft = await prisma.draft.findUnique({
      where: { id },
    });

    if (!draft || draft.userId !== userId) {
      return res.status(404).json({ success: false, error: "Draft not found" });
    }

    if (draft.status !== "pending") {
      return res.status(400).json({ success: false, error: "Draft is not pending" });
    }

    const updated = await prisma.draft.update({
      where: { id },
      data: {
        status: "approved",
        approvedAt: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error approving draft:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/drafts/:id/reject - Reject draft
router.post("/:id/reject", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const draft = await prisma.draft.findUnique({
      where: { id },
    });

    if (!draft || draft.userId !== userId) {
      return res.status(404).json({ success: false, error: "Draft not found" });
    }

    if (draft.status !== "pending") {
      return res.status(400).json({ success: false, error: "Draft is not pending" });
    }

    const updated = await prisma.draft.update({
      where: { id },
      data: { status: "rejected" },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error rejecting draft:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/drafts/:id - Delete draft
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const draft = await prisma.draft.findUnique({
      where: { id },
    });

    if (!draft || draft.userId !== userId) {
      return res.status(404).json({ success: false, error: "Draft not found" });
    }

    await prisma.draft.delete({
      where: { id },
    });

    res.json({ success: true, message: "Draft deleted" });
  } catch (error: any) {
    console.error("Error deleting draft:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
