# ✅ First Run Checklist

Follow these steps to get your X Assistant system running in ~30 minutes.

---

## Phase 1: Quick Setup (5 mins)

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`

---

## Phase 2: Telegram Bot (5 mins)

- [ ] Open [@BotFather](https://t.me/botfather)
- [ ] Create bot with `/newbot`
- [ ] Copy token to `TELEGRAM_BOT_TOKEN` in `.env`
- [ ] Send bot a message to test (`/start`)

---

## Phase 3: X OAuth Setup (10 mins)

- [ ] Go to [developer.twitter.com](https://developer.twitter.com)
- [ ] Create app or use existing
- [ ] In "User authentication settings":
  - Enable OAuth 2.0
  - Set Callback: `http://localhost:3000/api/x-auth/callback`
  - Request all scopes (tweet.read, tweet.write, etc.)
- [ ] Copy Client ID → `X_CLIENT_ID` in `.env`
- [ ] Copy Client Secret → `X_CLIENT_SECRET` in `.env`

---

## Phase 4: Database (5 mins)

- [ ] Start PostgreSQL (or use Docker: `docker run postgres`)
- [ ] Create database: `createdb telegram_x_assistant`
- [ ] Update `DATABASE_URL` in `.env`
- [ ] Run `npx prisma db push`

---

## Phase 5: Generate Encryption Key (1 min)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy result → `ENCRYPTION_KEY` in `.env`

---

## Phase 6: Run Locally (2 mins)

```bash
npm run dev
```

This starts:
- API on http://localhost:3000
- Mini App on http://localhost:5173
- Bot (listening)

---

## Phase 7: Test (2 mins)

### In Telegram:

1. Find your bot (`@x_assistant_bot` or whatever you named it)
2. Send `/start`
   - Should see welcome + buttons
3. Send `/stats`
   - Should see today's numbers (all zeros is fine)
4. Click "Open Dashboard"
   - Should open Mini App in Telegram
5. In Mini App, go to Settings → Connect X Account
   - Should redirect to X login
   - Approve permissions
   - Should say "✅ Connected"

---

## Phase 8: Create Test Post (Optional)

1. In Mini App, go to Queue
2. Create a draft (or check if any exist)
3. Click "Approve"
4. Click "🚀 Publish Now"
5. Check your X account - tweet should appear!

---

## 🎉 You're Done!

Your full system is now running:

✅ **Telegram Bot** - Commands, stats, queue  
✅ **Mini App** - Dashboard, drafts, settings  
✅ **Backend API** - Secure auth, posting, analytics  
✅ **Database** - PostgreSQL  
✅ **X Integration** - OAuth, posting, metrics  

---

## Next: Deploy to Production

When ready, see [SETUP.md → Deployment](./SETUP.md#deployment)

Options:
- Railway (easiest, free tier)
- Docker Compose
- Traditional VPS

---

## 🚨 Stuck?

### Common Issues

| Problem | Solution |
|---------|----------|
| Bot not responding | Check `TELEGRAM_BOT_TOKEN`, restart bot |
| Mini App shows blank | Verify `MINI_APP_URL` is http://localhost:5173 |
| X OAuth fails | Check Callback URI matches exactly in X Portal |
| Database error | Verify PostgreSQL running, DATABASE_URL correct |
| All tokens are invalid | Generate new `ENCRYPTION_KEY` |

### Logs

```bash
# Watch API logs
npm run dev -w apps/api

# Watch Bot logs
npm run dev -w apps/bot

# Watch Mini App logs
npm run dev -w apps/miniapp

# Or all at once:
npm run dev
```

---

## Questions?

- Review README.md for architecture
- Check SETUP.md for detailed configuration  
- Search GitHub issues
- Open a new discussion

---

**Enjoy building! 🚀**
