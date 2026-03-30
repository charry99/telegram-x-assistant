import crypto from "crypto";
import { TelegramWebAppInitData } from "../types/index.js";

export function verifyTelegramWebAppData(
  initData: string,
  botToken: string
): { valid: boolean; data?: TelegramWebAppInitData } {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");
    
    if (!hash) {
      return { valid: false };
    }

    // Remove hash from params for verification
    urlParams.delete("hash");

    // Create data check string
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // Create HMAC
    const hmac = crypto
      .createHmac("sha256", crypto.createHash("sha256").update(botToken).digest())
      .update(dataCheckString)
      .digest("hex");

    if (hmac !== hash) {
      return { valid: false };
    }

    // Parse and return data
    const data: any = {};
    urlParams.forEach((value, key) => {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    });

    return { valid: true, data };
  } catch (error) {
    console.error("Error verifying Telegram data:", error);
    return { valid: false };
  }
}

export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

export function hashString(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}

export function encryptString(str: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key.padEnd(32, "0").slice(0, 32)),
    iv
  );
  let encrypted = cipher.update(str, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptString(encrypted: string, key: string): string {
  const [ivHex, encryptedHex] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key.padEnd(32, "0").slice(0, 32)),
    iv
  );
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
