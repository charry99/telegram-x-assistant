import { TelegramWebAppInitData } from "@telegram-x-assistant/shared/types/index.js";

export class TelegramService {
  static initialize() {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      return tg;
    }
    return null;
  }

  static getInitDataRaw(): string {
    if (typeof window !== "undefined" && window.Telegram?.WebApp?.initData) {
      return window.Telegram.WebApp.initData;
    }
    // Fallback for local dev
    return "user=%7B%22id%22%3A123456789%7D&auth_date=1234567890&hash=abc123";
  }

  static sendData(data: Record<string, any>) {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.sendData(JSON.stringify(data));
    }
  }

  static sendAlert(message: string) {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.showAlert(message);
    }
  }

  static sendConfirm(message: string, callback: (result: boolean) => void) {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.showConfirm(message, callback);
    }
  }

  static getTheme(): "light" | "dark" {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      return tg.colorScheme === "dark" ? "dark" : "light";
    }
    return "dark";
  }

  static setupHapticFeedback(type: "light" | "medium" | "heavy" | "rigid" | "soft") {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.HapticFeedback.impact(type as any);
    }
  }
}

// Extend window type for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}
