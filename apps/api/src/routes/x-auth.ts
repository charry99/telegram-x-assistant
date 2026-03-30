import express, { Request, Response } from "express";
import { prisma } from "../index.js";
import { xOAuthService } from "../services/x-oauth.js";
import { generateRandomString } from "@telegram-x-assistant/shared/utils/crypto.js";

const router = express.Router();

interface OAuthState {
  [key: string]: {
    codeVerifier: string;
    createdAt: number;
    userId: string;
  };
}

// In-memory store for OAuth states (use Redis in production)
const oauthStates: OAuthState = {};

// GET /api/x-auth/start - Generate authorization URL
router.get("/start", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const state = generateRandomString(32);

    const { authUrl, codeVerifier } = await xOAuthService.generateAuthorizationUrl(state);

    // Store state and code verifier (expires in 10 minutes)
    oauthStates[state] = {
      codeVerifier,
      createdAt: Date.now(),
      userId,
    };

    // Clean up old states
    Object.entries(oauthStates).forEach(([key, value]) => {
      if (Date.now() - value.createdAt > 10 * 60 * 1000) {
        delete oauthStates[key];
      }
    });

    res.json({
      success: true,
      data: {
        authUrl,
        state,
      },
    });
  } catch (error: any) {
    console.error("Error starting OAuth:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/x-auth/callback - Handle OAuth callback
router.post("/callback", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { code, state } = req.body;

    if (!code || !state) {
      return res.status(400).json({ success: false, error: "Missing code or state" });
    }

    // Verify state
    const stateData = oauthStates[state];
    if (!stateData) {
      return res.status(400).json({ success: false, error: "Invalid or expired state" });
    }

    if (stateData.userId !== userId) {
      return res.status(401).json({ success: false, error: "State user mismatch" });
    }

    // Clean up state
    delete oauthStates[state];

    try {
      // Exchange code for tokens
      const tokens = await xOAuthService.exchangeCodeForTokens(code, stateData.codeVerifier);

      // Get user profile
      const profile = await xOAuthService.getUserProfile(tokens.access_token);

      // Encrypt tokens
      const encryptedTokens = xOAuthService.encryptTokens(
        tokens.access_token,
        tokens.refresh_token
      );

      // Save or update X account
      const xAccount = await prisma.xAccount.upsert({
        where: {
          xUserId: profile.id,
        },
        create: {
          userId,
          xUserId: profile.id,
          xHandle: profile.username,
          accessToken: encryptedTokens.accessToken,
          refreshToken: encryptedTokens.refreshToken,
        },
        update: {
          accessToken: encryptedTokens.accessToken,
          refreshToken: encryptedTokens.refreshToken,
          lastSyncedAt: new Date(),
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId,
          action: "x_account_connected",
          metadata: {
            xHandle: profile.username,
          },
        },
      });

      res.json({
        success: true,
        data: {
          xAccount: {
            id: xAccount.id,
            xHandle: xAccount.xHandle,
            connectedAt: xAccount.connectedAt,
          },
          profile,
        },
      });
    } catch (xError: any) {
      console.error("X OAuth error:", xError);
      res.status(400).json({
        success: false,
        error: "Failed to connect X account: " + xError.message,
      });
    }
  } catch (error: any) {
    console.error("Error in OAuth callback:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/x-auth/status - Get X account connection status
router.get("/status", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const xAccount = await prisma.xAccount.findFirst({
      where: { userId },
      select: {
        id: true,
        xHandle: true,
        xUserId: true,
        connectedAt: true,
        lastSyncedAt: true,
      },
    });

    res.json({
      success: true,
      data: {
        connected: !!xAccount,
        account: xAccount || null,
      },
    });
  } catch (error: any) {
    console.error("Error fetching auth status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/x-auth/disconnect - Disconnect X account
router.delete("/disconnect", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const xAccount = await prisma.xAccount.findFirst({
      where: { userId },
    });

    if (!xAccount) {
      return res.status(404).json({ success: false, error: "X account not found" });
    }

    await prisma.xAccount.delete({
      where: { id: xAccount.id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "x_account_disconnected",
        metadata: {
          xHandle: xAccount.xHandle,
        },
      },
    });

    res.json({ success: true, message: "X account disconnected" });
  } catch (error: any) {
    console.error("Error disconnecting X account:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
