import crypto from "crypto";

export interface TelegramWebAppInitData {
  user?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  chat_instance?: string;
  chat_type?: string;
  auth_date: number;
  hash: string;
}

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

    urlParams.delete("hash");

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const hmac = crypto
      .createHmac("sha256", crypto.createHash("sha256").update(botToken).digest())
      .update(dataCheckString)
      .digest("hex");

    if (hmac !== hash) {
      return { valid: false };
    }

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

export function encryptString(str: string, key: string): string {
  const keyBuffer = Buffer.from(key, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(str, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decryptString(encrypted: string, key: string): string {
  const keyBuffer = Buffer.from(key, "hex");
  const [ivHex, encryptedHex] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function hashString(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}

export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}