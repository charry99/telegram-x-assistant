import express, { Request, Response } from "express";
import { prisma } from "../index.js";
import { xPostingService } from "../services/posting.js";
import { xOAuthService } from "../services/x-oauth.js";

const router = express.Router();

// POST /api/publish/:draftId - Publish an approved draft
router.post("/:draftId", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { draftId } = req.params;
    const { replyToId } = req.body;

    // Get draft
    const draft = await prisma.draft.findUnique({
      where: { id: draftId },
    });

    if (!draft || draft.userId !== userId) {
      return res.status(404).json({ success: false, error: "Draft not found" });
    }

    if (draft.status !== "approved") {
      return res.status(400).json({ success: false, error: "Draft must be approved first" });
    }

    // Get user's X account
    const xAccount = await prisma.xAccount.findFirst({
      where: { userId },
    });

    if (!xAccount) {
      return res.status(400).json({ success: false, error: "X account not connected" });
    }

    try {
      // Decrypt access token
      const accessToken = xOAuthService.decryptToken(xAccount.accessToken);

      // Create tweet
      const tweet = await xPostingService.createTweet(
        accessToken,
        draft.draftText,
        replyToId
      );

      // Save post record
      const post = await prisma.post.create({
        data: {
          userId,
          xPostId: tweet.id,
          text: draft.draftText,
          kind: replyToId ? "reply" : "original",
        },
      });

      // Update draft status
      await prisma.draft.update({
        where: { id: draftId },
        data: {
          status: "posted",
          postedAt: new Date(),
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId,
          action: "post_published",
          metadata: {
            draftId,
            postId: post.id,
            xPostId: tweet.id,
          },
        },
      });

      res.json({
        success: true,
        data: {
          draft: draft,
          post,
          tweet,
        },
      });
    } catch (xError: any) {
      console.error("X API error:", xError);
      res.status(400).json({
        success: false,
        error: "Failed to publish tweet: " + xError.message,
      });
    }
  } catch (error: any) {
    console.error("Error publishing:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/publish/stats/today - Get today's posting stats
router.get("/stats/today", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = {
      draftsGenerated: await prisma.draft.count({
        where: {
          userId,
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      draftsApproved: await prisma.draft.count({
        where: {
          userId,
          status: "approved",
          approvedAt: { gte: today, lt: tomorrow },
        },
      }),
      postsPublished: await prisma.post.count({
        where: {
          userId,
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
    };

    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
