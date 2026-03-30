# X Assistant 🚀

A **production-grade** Telegram bot + Mini App + Backend system for safe, responsible X (Twitter) engagement.

**What it does:**
- 📝 Draft tweets with AI suggestions
- ✅ Approve before posting (never auto-post)
- 🎯 Track metrics in real-time
- 🔐 Secure token encryption
- 📊 Beautiful Telegram Mini App UI

---

## 🏗️ Architecture

### Three-layer system:

1. **Telegram Bot** (`apps/bot/`)
   - Commands: `/start`, `/dashboard`, `/stats`, `/queue`, `/settings`
   - Webhook for real-time updates
   - Web App buttons for Mini App

2. **Backend API** (`apps/api/`)
   - Express + Prisma + PostgreSQL
   - OAuth flows (Telegram, X)
   - Draft mgmt + Publishing
   - Analytics

3. **Mini App** (`apps/miniapp/`)
   - React dashboard
   - Draft queue + approval
   - X connection
   - Settings + Analytics

### Database:
- PostgreSQL with Prisma ORM
- Tables: users, x_accounts, drafts, posts, analytics, watchlists, activity_logs

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- X Developer account
- Telegram BotFather token

### 1. Clone & Install

```bash
# Clone the repo
git clone <repo-url>
cd telegram-x-assistant

# Install dependencies
npm install
```

### 2. Set up Environment

```bash
# Copy .env template
cp .env.example .env

# Edit .env with your tokens:
# - TELEGRAM_BOT_TOKEN (from @BotFather)
# - X_CLIENT_ID, X_CLIENT_SECRET (from developer.twitter.com)
# - DATABASE_URL (PostgreSQL connection)
# - ENCRYPTION_KEY (generate: node -e "...")
```

### 3. Database Setup

```bash
# Create .env and run migrations
npm run db:push

# Or with Docker:
docker-compose up -d db
npx prisma db push
```

### 4. Run Local

```bash
# Start all services (API, Bot, Mini App)
npm run dev

# Or individually:
npm run dev -w apps/api      # http://localhost:3000
npm run dev -w apps/bot      # Connects to your bot token
npm run dev -w apps/miniapp  # http://localhost:5173
```

### 5. Connect Mini App

Set webhook URL in API and update Telegram bot settings to point to your webhook.

---

## 📋 Setup Checklist

### Telegram
- [ ] Create bot with @BotFather
- [ ] Copy bot token → `TELEGRAM_BOT_TOKEN`
- [ ] Set `/setcommandsdescription` in BotFather
- [ ] Test `/start` command

### X API
- [ ] Go to https://developer.twitter.com/en/portal/dashboard
- [ ] Create OAuth 2.0 app
- [ ] Copy Client ID → `X_CLIENT_ID`
- [ ] Copy Client Secret → `X_CLIENT_SECRET`
- [ ] Set Redirect URI → `X_REDIRECT_URI` (must match .env)
- [ ] Request scopes: `tweet.read`, `tweet.write`, `users.read`, `follows.read`

### Database
- [ ] PostgreSQL running locally or remote
- [ ] Connection string → `DATABASE_URL`
- [ ] Run `npm run db:push`
- [ ] Verify tables created

### Mini App
- [ ] Hosted on HTTPS (required for Telegram)
- [ ] Set `MINI_APP_URL` in .env
- [ ] Bot webhook points to API

---

## 🔑 Core Features

### Mini App Pages

#### Dashboard
- Today's stats (drafts, approvals, posts)
- X connection status
- Quick action buttons

#### Queue
- List pending drafts
- Review + edit content
- Approve/reject/publish
- Real-time character count

#### Settings
- Default tone (sharp, funny, informative, neutral)
- Daily post limits
- Quiet hours
- Data export

#### X Auth
- Secure OAuth flow with PKCE
- User permissions
- Token encryption at rest

### API Routes

```
# Drafts
GET    /api/drafts
POST   /api/drafts
PUT    /api/drafts/:id
POST   /api/drafts/:id/approve
POST   /api/drafts/:id/reject
DELETE /api/drafts/:id

# Publishing
POST   /api/publish/:draftId
GET    /api/publish/stats/today

# Analytics
GET    /api/analytics/today
GET    /api/analytics/snapshot
POST   /api/analytics/sync
GET    /api/analytics/history

# X OAuth
GET    /api/x-auth/start
POST   /api/x-auth/callback
GET    /api/x-auth/status
DELETE /api/x-auth/disconnect
```

---

## 🔐 Security

✅ **Token Encryption:**
- X access/refresh tokens encrypted with AES-256-CBC
- Encryption key stored in env

✅ **Auth Verification:**
- Telegram Mini App init data validated on every request
- Bearer token + X-Init-Data headers required

✅ **Database:**
- Parameterized queries (Prisma ORM)
- Password hashing ready for user accounts

✅ **Deployment:**
- HTTPS only (required for Mini App)
- Rate limiting recommended
- CORS configured

---

## 📦 Deployment

### Docker Compose (Easiest)

```bash
# Set up .env with production values
docker-compose up -d

# Check logs
docker-compose logs -f api
```

### Manual Deployment

#### Option 1: Railway / Render

```bash
# Install CLI
npm install -g railway
# or visit render.com

# Deploy
railway deploy
```

#### Option 2: AWS / GCP / DigitalOcean

1. Create VM
2. Install Node + PostgreSQL
3. Clone repo
4. `npm install && npm run build && npm start`
5. Set up Nginx reverse proxy
6. Enable HTTPS (Let's Encrypt)

#### Option 3: Vercel (Mini App only)

```bash
cd apps/miniapp
vercel deploy
```

---

## 🧪 Testing

### Local Testing

```bash
# Start dev server
npm run dev

# Test Telegram bot
# Message @YourBotName /start

# Test Mini App
# Open http://localhost:5173 in browser
# Login with Telegram

# Test API endpoints
curl -H "X-Init-Data: ..." http://localhost:3000/api/drafts
```

### API Testing with Insomnia/Postman

```
GET /health
→ { "status": "ok" }

GET /api/drafts
Headers: X-Init-Data: <telegram-init-data>
→ { "success": true, "data": [...] }
```

---

## 🐛 Troubleshooting

### "Telegram initDataUnsafe is null"
- Running in browser? Set `REACT_APP_MOCK_TELEGRAM=true`
- Mini App must be launched from Telegram bot button

### "X OAuth returns 401"
- Verify X_CLIENT_ID and X_CLIENT_SECRET in .env
- Check X_REDIRECT_URI matches Developer Portal

### "Database connection failed"
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check firewall ports

### "Mini App button not working"
- Verify Mini App URL is HTTPS
- Check bot webhook configured in Telegram API
- Reload Telegram app

---

## 📚 Next Steps

### Phase 2 Features
- AI draft suggestions (OpenAI/Claude)
- Watchlist monitoring
- Team mode (multiple admins)
- Content calendar
- Advanced analytics

### Phase 3 Features
- Multiple X accounts
- Batch scheduling
- Competitor analysis
- Trending topic alerts
- Custom workflows

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Open PR

---

## 📄 License

MIT

---

## 🔗 Resources

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [X API Documentation](https://developer.twitter.com/en/docs)
- [Prisma ORM](https://www.prisma.io)
- [Express.js](https://expressjs.com)

---

## 📞 Support

- 🐛 Report bugs on GitHub Issues
- 💬 Questions? Start a Discussion
- 📧 Email: support@your-domain.com

---

**Built with ❤️ for responsible X engagement**
