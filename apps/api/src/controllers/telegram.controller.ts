import { Request, Response } from "express";

export async function telegramWebhook(req: Request, res: Response) {
  console.log("Telegram update:", req.body);
  res.json({ ok: true });
}