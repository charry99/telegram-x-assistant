import axios from "axios";
import crypto from "crypto";
import pkceChallenge from "pkce-challenge";
import { encryptString, decryptString } from "../utils/crypto.js";

export interface XOAuthTokens {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

const X_API_BASE = "https://api.x.com";
const X_AUTH_URL = "https://twitter.com/i/oauth2/authorize";
const X_TOKEN_URL = `${X_API_BASE}/2/oauth2/token`;

export class XOAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private encryptionKey: string;

  constructor() {
    this.clientId = process.env.X_CLIENT_ID || "";
    this.clientSecret = process.env.X_CLIENT_SECRET || "";
    this.redirectUri = process.env.X_REDIRECT_URI || "";
    this.encryptionKey = process.env.ENCRYPTION_KEY || "default-key";

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error("Missing X OAuth environment variables");
    }
  }

  /**
   * Generate OAuth authorization URL
   */
  async generateAuthorizationUrl(state: string): Promise<{
    authUrl: string;
    codeVerifier: string;
  }> {
    const { code_challenge, code_verifier } = await pkceChallenge();

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: [
        "tweet.read",
        "tweet.write",
        "users.read",
        "follows.read",
        "follows.write",
        "offline.access",
      ].join(" "),
      state,
      code_challenge,
      code_challenge_method: "S256",
    });

    return {
      authUrl: `${X_AUTH_URL}?${params.toString()}`,
      codeVerifier: code_verifier,
    };
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<XOAuthTokens> {
    try {
      const response = await axios.post(
        X_TOKEN_URL,
        {
          grant_type: "authorization_code",
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          code_verifier: codeVerifier,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error exchanging code for tokens:", error.response?.data || error.message);
      throw new Error("Failed to exchange code for tokens");
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(encryptedRefreshToken: string): Promise<XOAuthTokens> {
    try {
      const refreshToken = decryptString(encryptedRefreshToken, this.encryptionKey);

      const response = await axios.post(
        X_TOKEN_URL,
        {
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error refreshing token:", error.response?.data || error.message);
      throw new Error("Failed to refresh access token");
    }
  }

  /**
   * Get user profile from X API
   */
  async getUserProfile(accessToken: string) {
    try {
      const response = await axios.get(`${X_API_BASE}/2/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          "user.fields": [
            "id",
            "name",
            "username",
            "created_at",
            "description",
            "public_metrics",
            "verified",
          ].join(","),
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching user profile:", error.response?.data || error.message);
      throw new Error("Failed to fetch user profile");
    }
  }

  /**
   * Encrypt tokens for storage
   */
  encryptTokens(accessToken: string, refreshToken: string) {
    return {
      accessToken: encryptString(accessToken, this.encryptionKey),
      refreshToken: encryptString(refreshToken, this.encryptionKey),
    };
  }

  /**
   * Decrypt token
   */
  decryptToken(encryptedToken: string): string {
    return decryptString(encryptedToken, this.encryptionKey);
  }
}

export const xOAuthService = new XOAuthService();
