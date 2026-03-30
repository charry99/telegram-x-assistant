import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiClient } from "../lib/api";
import { TelegramService } from "../lib/telegram";
import Navbar from "../components/Navbar";
import "./XAuth.css";

function XAuth({ user }: { user: any }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're returning from OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleOAuthCallback = async (code: string, state: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await ApiClient.xAuthCallback(code, state);
      TelegramService.sendAlert("✅ X account connected successfully!");

      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      setError(err.message);
      TelegramService.sendAlert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await ApiClient.startXAuth();
      const { authUrl } = result.data;

      // Open X OAuth URL
      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.message);
      TelegramService.sendAlert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar title="Connect X Account" />
      <div className="xauth-container">
        <div className="xauth-card">
          <div className="xauth-icon">𝕏</div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="xauth-loading">
              <div className="spinner"></div>
              <p>Connecting your X account...</p>
            </div>
          ) : (
            <>
              <h1>Connect Your X Account</h1>
              <p className="xauth-description">
                Grant permission to post tweets and access your analytics. Your credentials are encrypted and secure.
              </p>

              <div className="permissions-list">
                <h3>Permissions Required:</h3>
                <ul>
                  <li>✓ Post tweets and replies</li>
                  <li>✓ Read your posts and analytics</li>
                  <li>✓ Follow/unfollow accounts</li>
                  <li>✓ Like and retweet</li>
                </ul>
              </div>

              <button
                className="btn btn-primary xauth-btn"
                onClick={handleStartAuth}
                disabled={loading}
              >
                Connect with X
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => navigate("/")}
              >
                Cancel
              </button>

              <div className="xauth-note">
                <p>🔐 We never store your password. OAuth tokens are encrypted.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default XAuth;
