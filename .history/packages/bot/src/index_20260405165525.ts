import dotenv from "dotenv";
dotenv.config();

import { Telegraf, Markup } from "telegraf";
import axios from "axios";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const API_URL = process.env.API_URL!;

bot.start(async (ctx) => {
  await ctx.reply("Welcome to Telegram X Assistant.");
});

bot.command("drafts", async (ctx) => {
  const { data } = await axios.get(`${API_URL}/drafts`);

  if (!data.length) {
    return ctx.reply("No drafts found.");
  }

  for (const draft of data.slice(0, 5)) {
    await ctx.reply(
      `Draft:\n\n${draft.content}\n\nStatus: ${draft.status}`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(`Approve`, `approve:${draft.id}`),
          Markup.button.callback(`Reject`, `reject:${draft.id}`)
        ]
      ])
    );
  }
});

bot.action(/approve:(.+)/, async (ctx) => {
  const id = ctx.match[1];
  await axios.patch(`${API_URL}/drafts/${id}/approve`);
  await ctx.editMessageText(`Draft approved: ${id}`);
});

bot.action(/reject:(.+)/, async (ctx) => {
  const id = ctx.match[1];
  await axios.patch(`${API_URL}/drafts/${id}/reject`);
  await ctx.editMessageText(`Draft rejected: ${id}`);
});

bot.launch().then(() => {
  console.log("Telegram bot running");
});
