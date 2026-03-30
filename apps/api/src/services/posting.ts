import axios from "axios";
import { xOAuthService } from "./x-oauth.js";

const X_API_BASE = "https://api.x.com";

export class XPostingService {
  /**
   * Create a new tweet
   */
  async createTweet(accessToken: string, text: string, replyToId?: string) {
    try {
      const payload: any = { text };
      if (replyToId) {
        payload.reply = { in_reply_to_tweet_id: replyToId };
      }

      const response = await axios.post(`${X_API_BASE}/2/tweets`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error("Error creating tweet:", error.response?.data || error.message);
      throw new Error("Failed to create tweet");
    }
  }

  /**
   * Get user's recent tweets
   */
  async getUserTweets(accessToken: string, userId: string, limit: number = 10) {
    try {
      const response = await axios.get(`${X_API_BASE}/2/users/${userId}/tweets`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          max_results: limit,
          "tweet.fields": [
            "created_at",
            "author_id",
            "public_metrics",
            "conversation_id",
          ].join(","),
        },
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error("Error fetching user tweets:", error.response?.data || error.message);
      throw new Error("Failed to fetch user tweets");
    }
  }

  /**
   * Get tweet details
   */
  async getTweetDetails(accessToken: string, tweetId: string) {
    try {
      const response = await axios.get(`${X_API_BASE}/2/tweets/${tweetId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          "tweet.fields": [
            "created_at",
            "author_id",
            "public_metrics",
            "conversation_id",
          ].join(","),
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching tweet details:", error.response?.data || error.message);
      throw new Error("Failed to fetch tweet details");
    }
  }

  /**
   * Like a tweet
   */
  async likeTweet(accessToken: string, userId: string, tweetId: string) {
    try {
      const response = await axios.post(
        `${X_API_BASE}/2/users/${userId}/likes`,
        { tweet_id: tweetId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Error liking tweet:", error.response?.data || error.message);
      throw new Error("Failed to like tweet");
    }
  }

  /**
   * Retweet
   */
  async retweet(accessToken: string, userId: string, tweetId: string) {
    try {
      const response = await axios.post(
        `${X_API_BASE}/2/users/${userId}/retweets`,
        { tweet_id: tweetId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error("Error retweeting:", error.response?.data || error.message);
      throw new Error("Failed to retweet");
    }
  }

  /**
   * Get user's followers count
   */
  async getUserFollowersCount(accessToken: string, userId: string) {
    try {
      const response = await axios.get(`${X_API_BASE}/2/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          "user.fields": "public_metrics",
        },
      });

      return response.data.data?.public_metrics?.followers_count || 0;
    } catch (error: any) {
      console.error("Error fetching followers count:", error.response?.data || error.message);
      return 0;
    }
  }
}

export const xPostingService = new XPostingService();
