import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/Dashboard";
import QueuePage from "./pages/Queue";
import SettingsPage from "./pages/Settings";
import XAuthPage from "./pages/XAuth";
import { TelegramService } from "./lib/telegram";
import "./App.css";

interface User {
  id?: string;
  telegramUserId: number;
  firstName?: string;
  username?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = TelegramService.initialize();

    if (tg && tg.initDataUnsafe?.user) {
      const userData = tg.initDataUnsafe.user;
      setUser({
        telegramUserId: userData.id,
        firstName: userData.first_name,
        username: userData.username,
      });
    }

    // Expand to fullscreen
    if (tg) {
      tg.expand();
      tg.setHeaderColor("#000000");
      tg.setBackgroundColor("#000000");
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardPage user={user} />} />
          <Route path="/queue" element={<QueuePage user={user} />} />
          <Route path="/settings" element={<SettingsPage user={user} setUser={setUser} />} />
          <Route path="/x-auth" element={<XAuthPage user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
