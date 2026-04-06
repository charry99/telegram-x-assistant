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

  await ctx.reply("🚀 Click below to open your dashboard:", {
    reply_markup: keyboard,
  });
});

// Command: /stats
bot.command("stats", async (ctx) => {
  try {
    const userId = ctx.from.id;

    // Get user from DB to get their UUID
    const user = await prisma.user.findUnique({
      where: { telegramUserId: userId },
    });

    if (!user) {
      return ctx.reply("❌ User not found. Please start with /start");
    }

    // Fetch today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = {
      draftsGenerated: await prisma.draft.count({
        where: {
          userId: user.id,
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      draftsApproved: await prisma.draft.count({
        where: {
          userId: user.id,
          status: "approved",
          approvedAt: { gte: today, lt: tomorrow },
        },
      }),
      postsPublished: await prisma.post.count({
        where: {
          userId: user.id,
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
    };

    const statsText =
      `📊 **Today's Statistics**\n\n` +
      `📝 Drafts Generated: ${stats.draftsGenerated}\n` +
      `✅ Approved: ${stats.draftsApproved}\n` +
      `🚀 Published: ${stats.postsPublished}\n\n` +
      `📈 Open dashboard for detailed analytics`;

    await ctx.reply(statsText, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error fetching stats:", error);
    await ctx.reply("❌ Error fetching stats. Please try again.");
  }
});

// Command: /queue
bot.command("queue", async (ctx) => {
  try {
    const userId = ctx.from.id;

    const user = await prisma.user.findUnique({
      where: { telegramUserId: userId },
    });

    if (!user) {
      return ctx.reply("❌ User not found. Please start with /start");
    }

    const pendingDrafts = await prisma.draft.findMany({
      where: {
        userId: user.id,
        status: "pending",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    if (pendingDrafts.length === 0) {
      return ctx.reply("✅ No pending drafts!");
    }

    let queueText = `📋 **Pending Drafts (${pendingDrafts.length})**\n\n`;
    pendingDrafts.forEach((draft, index) => {
      const preview = draft.draftText.substring(0, 50) + "...";
      queueText += `${index + 1}. ${preview}\n`;
    });

    queueText += `\n📊 Open dashboard to review and approve.`;

    await ctx.reply(queueText, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error fetching queue:", error);
    await ctx.reply("❌ Error fetching queue. Please try again.");
  }
});

// Command: /settings
bot.command("settings", async (ctx) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: "⚙️ Open Settings", web_app: { url: `${MINI_APP_URL}?tab=settings` } }],
    ],
  };

  await ctx.reply("⚙️ Access your settings in the dashboard:", {
    reply_markup: keyboard,
  });
});

// Callback: stats_today
bot.action("stats_today", async (ctx) => {
  try {
    const userId = ctx.from!.id;

    const user = await prisma.user.findUnique({
      where: { telegramUserId: userId },
    });

    if (!user) {
      return ctx.answerCbQuery("User not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = {
      draftsGenerated: await prisma.draft.count({
        where: {
          userId: user.id,
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      draftsApproved: await prisma.draft.count({
        where: {
          userId: user.id,
          status: "approved",
          approvedAt: { gte: today, lt: tomorrow },
        },
      }),
      postsPublished: await prisma.post.count({
        where: {
          userId: user.id,
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
    };

    const statsText =
      `📊 **Today's Statistics**\n\n` +
      `📝 Drafts Generated: ${stats.draftsGenerated}\n` +
      `✅ Approved: ${stats.draftsApproved}\n` +
      `🚀 Published: ${stats.postsPublished}`;

    await ctx.editMessageText(statsText, { parse_mode: "Markdown" });
    await ctx.answerCbQuery();
  } catch (error) {
    console.error("Error:", error);
    await ctx.answerCbQuery("Error loading stats");
  }
});

// Callback: queue
bot.action("queue", async (ctx) => {
  try {
    const userId = ctx.from!.id;

    const user = await prisma.user.findUnique({
      where: { telegramUserId: userId },
    });

    if (!user) {
      return ctx.answerCbQuery("User not found");
    }

    const pendingDrafts = await prisma.draft.findMany({
      where: {
        userId: user.id,
        status: "pending",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    if (pendingDrafts.length === 0) {
      await ctx.editMessageText("✅ No pending drafts!");
    } else {
      let queueText = `📋 **Pending Drafts (${pendingDrafts.length})**\n\n`;
      pendingDrafts.forEach((draft, index) => {
        const preview = draft.draftText.substring(0, 50) + "...";
        queueText += `${index + 1}. ${preview}\n`;
      });
      queueText += `\n📊 Open dashboard to review and approve.`;
      await ctx.editMessageText(queueText, { parse_mode: "Markdown" });
    }

    await ctx.answerCbQuery();
  } catch (error) {
    console.error("Error:", error);
    await ctx.answerCbQuery("Error loading queue");
  }
});

// Callback: settings
bot.action("settings", async (ctx) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: "⚙️ Open Settings", web_app: { url: `${MINI_APP_URL}?tab=settings` } }],
    ],
  };

  await ctx.editMessageText("⚙️ Access your settings in the dashboard:", {
    reply_markup: keyboard,
  });
  await ctx.answerCbQuery();
});

// Callback: help
bot.action("help", async (ctx) => {
  const helpText =
    `**📖 Help & Commands**\n\n` +
    `/dashboard - Open Mini App\n` +
    `/stats - Today's metrics\n` +
    `/queue - Pending drafts\n` +
    `/settings - Configure\n` +
    `/help - This message\n\n` +
    `**Features:**\n` +
    `🎯 Create suggestions\n` +
    `✅ Approve before posting\n` +
    `🚀 One-click publish\n` +
    `📊 Analytics\n` +
    `🔐 Secure`;

  await ctx.editMessageText(helpText, { parse_mode: "Markdown" });
  await ctx.answerCbQuery();
});

// Handle web_app_data from Mini App
bot.on("web_app_data", async (ctx) => {
  if (!ctx.webAppData || !ctx.webAppData.data) {
    await ctx.reply("Error: No data received from app");
    return;
  }

  const data = ctx.webAppData.data;
  console.log("Received Web App data:", data);

  // Parse the data from Mini App
  try {
    const dataString = typeof data === "string" ? data : JSON.stringify(data);
    const payload = JSON.parse(dataString);
    console.log("Parsed payload:", payload);

    // Handle different actions from Mini App
    switch (payload.action) {
      case "publish_success":
        await ctx.reply(`✅ Tweet published successfully!\n\n#${payload.tweetId}`);
        break;
      case "draft_approved":
        await ctx.reply(`✅ Draft approved! Ready to publish.`);
        break;
      default:
        await ctx.reply(`Received: ${payload.action}`);
    }
  } catch (error) {
    console.error("Error parsing web app data:", error);
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Launch bot
bot.launch();

console.log("🤖 Telegram bot started");

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

export default bot;
