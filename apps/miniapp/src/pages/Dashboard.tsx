import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiClient } from "../lib/api";
import { TelegramService } from "../lib/telegram";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

interface DashboardStats {
  draftsGenerated: number;
  draftsApproved: number;
  postsPublished: number;
}

function Dashboard({ user }: { user: any }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [xConnected, setXConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch today's stats
      const statsRes = await ApiClient.getAnalyticsToday();
      setStats(statsRes.data);

      // Check X auth status
      const xStatus = await ApiClient.getXAuthStatus();
      setXConnected(xStatus.data.connected);
    } catch (err: any) {
      console.error("Error loading dashboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleXConnect = () => {
    navigate("/x-auth");
  };

  const handleXDisconnect = async () => {
    try {
      await ApiClient.disconnectXAuth();
      setXConnected(false);
      TelegramService.sendAlert("✅ X account disconnected");
    } catch (err: any) {
      TelegramService.sendAlert("❌ Error disconnecting X account");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar title="Dashboard" />
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="Dashboard" />
      <div className="dashboard-container">
        {error && <div className="error-banner">{error}</div>}

        <div className="welcome-section">
          <h1>👋 Welcome, {user?.firstName || "User"}!</h1>
          <p>Your X engagement dashboard</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-value">{stats?.draftsGenerated || 0}</div>
            <div className="stat-label">Drafts Created</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats?.draftsApproved || 0}</div>
            <div className="stat-label">Approved</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚀</div>
            <div className="stat-value">{stats?.postsPublished || 0}</div>
            <div className="stat-label">Published</div>
          </div>
        </div>

        <div className="section">
          <h2>📱 X Connection</h2>
          <div className="connection-card">
            <div className="connection-status">
              <div className={`status-indicator ${xConnected ? "connected" : "disconnected"}`}></div>
              <div>
                <p className="connection-title">
                  {xConnected ? "✅ Connected" : "❌ Not Connected"}
                </p>
                <p className="connection-subtitle">
                  {xConnected
                    ? "Your X account is linked and ready to use"
                    : "Connect your X account to post tweets"}
                </p>
              </div>
            </div>

            {xConnected ? (
              <button className="btn btn-danger" onClick={handleXDisconnect}>
                Disconnect
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleXConnect}>
                Connect X Account
              </button>
            )}
          </div>
        </div>

        <div className="section">
          <h2>⚡ Quick Actions</h2>
          <div className="action-buttons">
            <button
              className="action-btn"
              onClick={() => navigate("/queue")}
            >
              <span className="btn-icon">📋</span>
              <span className="btn-text">Review Queue</span>
            </button>

            <button
              className="action-btn"
              onClick={() => navigate("/settings")}
            >
              <span className="btn-icon">⚙️</span>
              <span className="btn-text">Settings</span>
            </button>
          </div>
        </div>

        <div className="section">
          <h2>💡 Tips</h2>
          <div className="tips-list">
            <div className="tip-item">✨ Create drafts and review before posting</div>
            <div className="tip-item">🎯 Use tones to customize your voice</div>
            <div className="tip-item">📊 Track your engagement in real-time</div>
            <div className="tip-item">🔐 Your tokens are encrypted and secure</div>
          </div>
        </div>

        <button
          className="btn btn-secondary"
          style={{ width: "100%", marginTop: "20px" }}
          onClick={loadDashboard}
        >
          Refresh
        </button>
      </div>
    </>
  );
}

export default Dashboard;
