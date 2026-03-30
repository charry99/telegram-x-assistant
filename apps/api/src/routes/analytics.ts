import express, { Request, Response } from "express";
import { prisma } from "../index.js";
import { xPostingService } from "../services/posting.js";
import { xOAuthService } from "../services/x-oauth.js";

const router = express.Router();

// GET /api/analytics/today - Get today's analytics
router.get("/today", async (req: Request, res: Response) => {
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
    console.error("Error fetching today's analytics:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/snapshot - Get latest analytics snapshot
router.get("/snapshot", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const snapshot = await prisma.analyticsSnapshot.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    });

    if (!snapshot) {
      return res.json({
        success: true,
        data: {
          date: new Date(),
          impressions: 0,
          likes: 0,
          replies: 0,
          reposts: 0,
          profileVisits: 0,
          followersDelta: 0,
        },
      });
    }

    res.json({ success: true, data: snapshot });
  } catch (error: any) {
    console.error("Error fetching analytics snapshot:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/analytics/sync - Sync analytics from X API (manual trigger)
router.post("/sync", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    // Get user's X account
    const xAccount = await prisma.xAccount.findFirst({
      where: { userId },
    });

    if (!xAccount) {
      return res.status(400).json({ success: false, error: "X account not connected" });
    }

    try {
      const accessToken = xOAuthService.decryptToken(xAccount.accessToken);

      // Fetch data from X API
      // Note: This is a simplified version. Real implementation would use X Analytics API
      const followersCount = await xPostingService.getUserFollowersCount(
        accessToken,
        xAccount.xUserId
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create or update snapshot
      const snapshot = await prisma.analyticsSnapshot.upsert({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        create: {
          userId,
          date: today,
          impressions: 0, // Would come from X Analytics API
          likes: 0,
          replies: 0,
          reposts: 0,
          profileVisits: 0,
          followersDelta: 0,
        },
        update: {
          // Update fields from X API
        },
      });

      res.json({
        success: true,
        message: "Analytics synced",
        data: snapshot,
      });
    } catch (xError: any) {
      console.error("X API error during sync:", xError);
      res.status(400).json({
        success: false,
        error: "Failed to sync analytics: " + xError.message,
      });
    }
  } catch (error: any) {
    console.error("Error syncing analytics:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/history - Get analytics history
router.get("/history", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { days = "30" } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));
    startDate.setHours(0, 0, 0, 0);

    const snapshots = await prisma.analyticsSnapshot.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: "asc" },
    });

    res.json({
      success: true,
      data: snapshots,
      period: `Last ${days} days`,
    });
  } catch (error: any) {
    console.error("Error fetching analytics history:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
