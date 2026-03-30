import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TelegramService } from "../lib/telegram";
import Navbar from "../components/Navbar";
import "./Settings.css";

function Settings({ user, setUser }: { user: any; setUser: any }) {
  const navigate = useNavigate();
  const [tone, setTone] = useState("informative");
  const [settings, setSettings] = useState({
    autoApprove: false,
    dailyLimit: 10,
    quietHours: false,
    quietStart: "22:00",
    quietEnd: "08:00",
  });

  const handleSettingsChange = (key: string, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    // Save to localStorage for demo
    localStorage.setItem("botSettings", JSON.stringify(updated));
  };

  const handleSaveTone = () => {
    localStorage.setItem("defaultTone", tone);
    TelegramService.sendAlert("✅ Default tone saved");
  };

  const handleExportSettings = () => {
    const data = {
      user,
      tone,
      settings,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `x-assistant-settings-${new Date().getTime()}.json`;
    link.click();

    TelegramService.sendAlert("✅ Settings exported");
  };

  return (
    <>
      <Navbar title="Settings" />
      <div className="settings-container">
        <div className="settings-section">
          <h2>👤 Profile</h2>
          <div className="setting-item">
            <label>Telegram ID</label>
            <p className="setting-value">{user?.telegramUserId}</p>
          </div>
          <div className="setting-item">
            <label>Username</label>
            <p className="setting-value">{user?.username || "Not set"}</p>
          </div>
        </div>

        <div className="settings-section">
          <h2>🎯 Default Tone</h2>
          <div className="tone-options">
            {["sharp", "funny", "informative", "neutral"].map((t) => (
              <button
                key={t}
                className={`tone-btn ${tone === t ? "active" : ""}`}
                onClick={() => setTone(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleSaveTone}>
            Save Tone
          </button>
        </div>

        <div className="settings-section">
          <h2>⚙️ Preferences</h2>

          <div className="setting-item">
            <div className="setting-label">
              <label>Daily Post Limit</label>
              <p className="setting-hint">Maximum posts to publish per day</p>
            </div>
            <input
              type="number"
              className="setting-input"
              value={settings.dailyLimit}
              onChange={(e) => handleSettingsChange("dailyLimit", parseInt(e.target.value))}
              min="1"
              max="50"
            />
          </div>

          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.quietHours}
                onChange={(e) => handleSettingsChange("quietHours", e.target.checked)}
              />
              <span>Enable Quiet Hours</span>
            </label>
            <p className="setting-hint">Don't post during these hours</p>

            {settings.quietHours && (
              <div className="quiet-hours-config">
                <input
                  type="time"
                  value={settings.quietStart}
                  onChange={(e) => handleSettingsChange("quietStart", e.target.value)}
                />
                <span>to</span>
                <input
                  type="time"
                  value={settings.quietEnd}
                  onChange={(e) => handleSettingsChange("quietEnd", e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.autoApprove}
                onChange={(e) => handleSettingsChange("autoApprove", e.target.checked)}
              />
              <span>Auto-approve drafts (experimental)</span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>🔐 Security</h2>
          <div className="security-info">
            <p>✓ All tokens are encrypted</p>
            <p>✓ Authentication is verified on every request</p>
            <p>✓ Data is stored securely</p>
          </div>
        </div>

        <div className="settings-section">
          <h2>💾 Data</h2>
          <button className="btn btn-secondary" onClick={handleExportSettings}>
            Export Settings
          </button>
        </div>

        <div className="settings-footer">
          <p>X Assistant v1.0.0</p>
          <p>Secure. Privacy-first. Open source.</p>
        </div>
      </div>
    </>
  );
}

export default Settings;
