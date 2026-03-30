📦 telegram-x-assistant/
├─ apps/
│  ├─ api/                      # Express backend
│  │  ├─ src/
│  │  │  ├─ index.ts           # Main Express app, auth middleware
│  │  │  ├─ services/
│  │  │  │  ├─ x-oauth.ts      # X OAuth 2.0 flow, token management
│  │  │  │  └─ posting.ts      # X API: posting, liking, retweeting
│  │  │  └─ routes/
│  │  │     ├─ drafts.ts       # CRUD drafts, status updates
│  │  │     ├─ publish.ts      # Publishing to X, stats
│  │  │     ├─ x-auth.ts       # X OAuth endpoints
│  │  │     └─ analytics.ts    # Analytics snapshots, history
│  │  └─ package.json
│  │
│  ├─ bot/                      # Telegraf bot
│  │  ├─ src/
│  │  │  └─ index.ts           # Bot commands, callbacks, web_app_data handler
│  │  └─ package.json
│  │
│  ├─ miniapp/                  # React Mini App
│  │  ├─ src/
│  │  │  ├─ App.tsx            # Router, Telegram init
│  │  │  ├─ App.css            # Global styles
│  │  │  ├─ main.tsx           # React entry point
│  │  │  ├─ lib/
│  │  │  │  ├─ telegram.ts     # Telegram WebApp SDK wrapper
│  │  │  │  └─ api.ts          # API client with auth headers
│  │  │  ├─ pages/
│  │  │  │  ├─ Dashboard.tsx   # Main stats & X connection
│  │  │  │  ├─ Dashboard.css
│  │  │  │  ├─ Queue.tsx       # Draft review & approval
│  │  │  │  ├─ Queue.css
│  │  │  │  ├─ Settings.tsx    # User preferences
│  │  │  │  ├─ Settings.css
│  │  │  │  ├─ XAuth.tsx       # OAuth flow
│  │  │  │  └─ XAuth.css
│  │  │  └─ components/
│  │  │     ├─ Navbar.tsx      # Top nav bar
│  │  │     └─ Navbar.css
│  │  ├─ index.html            # Telegram WebApp script
│  │  ├─ vite.config.ts       # Vite bundler config
│  │  └─ package.json
│  │
│  └─ (more apps can be added here)
│
├─ packages/
│  └─ shared/                   # Monorepo shared code
│     ├─ src/
│     │  ├─ types/
│     │  │  └─ index.ts        # TypeScript interfaces (User, Draft, Post, etc)
│     │  └─ utils/
│     │     └─ crypto.ts       # Telegram verify, Token encrypt/decrypt
│     ├─ tsconfig.json
│     └─ package.json
│
├─ prisma/
│  └─ schema.prisma            # Database schema: users, x_accounts, drafts, posts, etc
│
├─ .env.example                # Template for environment variables
├─ docker-compose.yml          # PostgreSQL, Redis, API, Bot services
├─ package.json                # Root workspace config
├─ tsconfig.json               # TypeScript config
├─ README.md                   # Main documentation
├─ SETUP.md                    # Detailed setup & deployment guide
├─ FIRST_RUN.md                # Quick checklist
└─ PROJECT_STRUCTURE.txt       # This file

---

## 🏗️ Architecture Overview

### Three-Layer System:

1. **Bot Layer** (`apps/bot/`)
   - Handles `/start`, `/dashboard`, `/stats`, `/queue`, `/settings`
   - Sends web_app buttons for Mini App
   - Handles responses from Mini App via web_app_data

2. **API Layer** (`apps/api/`)
   - Express server on port 3000
   - Handles: drafts, publishing, analytics, X OAuth
   - Validates Telegram Mini App auth on every request
   - Stores/encrypts X tokens

3. **Client Layer** (`apps/miniapp/`)
   - React SPA on port 5173
   - Telegram Mini App inside Telegram app
   - Dark UI optimized for mobile
   - Routes: Dashboard, Queue, Settings, XAuth

4. **Database Layer** (`prisma/`)
   - PostgreSQL with Prisma ORM
   - Tables: User, XAccount, Draft, Post, AnalyticsSnapshot, Watchlist, ActivityLog

---

## 📊 Data Flow

### Posting Flow:

1. User opens Telegram bot
2. Bot sends "Open Dashboard" button
3. User opens Mini App
4. User creates/edits draft in Queue
5. User clicks "Approve"
6. User clicks "🚀 Publish Now"
7. Mini App sends request to API: `POST /api/publish/:draftId`
8. API fetches X account from DB (user's X tokens)
9. API calls X API to create tweet
10. API saves Post record
11. API updates Draft status to "posted"
12. Mini App shows success ✅

### Auth Flow:

1. User opens Mini App → Telegram sends `initData` (signed)
2. Mini App extracts `initData` → includes user ID, timestamp, signature
3. Mini App passes `initData` in `X-Init-Data` header for every API request
4. API verifies signature using `TELEGRAM_BOT_TOKEN`
5. If valid, extracts user ID and processes request
6. If invalid, returns 401

### X OAuth Flow:

1. User clicks "Connect X Account" in Settings
2. Mini App redirects to `GET /api/x-auth/start`
3. API generates PKCE challenge + auth URL
4. API redirects to X.com OAuth page
5. User authorizes & X redirects back with `code`
6. Mini App receives callback: `POST /api/x-auth/callback?code=...&state=...`
7. API exchanges code for tokens using PKCE
8. API encrypts + stores tokens in DB
9. Mini App shows "✅ Connected"

---

## 🔐 Security

- **Token Encryption**: X tokens encrypted with AES-256-CBC, key from env
- **Auth Verification**: Every API request checked against Telegram init data
- **HTTPS Only**: Required for production Mini App
- **Rate Limiting**: Ready to add (not included in MVP)
- **CORS**: Configured in Express
- **SQL Injection**: Protected by Prisma ORM parameterization

---

## 📦 Key Files

### Database
- `prisma/schema.prisma` - Full data model including encryption fields

### API
- `apps/api/src/index.ts` - Main server + auth middleware
- `apps/api/src/services/x-oauth.ts` - Complete OAuth 2.0 flow with PKCE
- `apps/api/src/services/posting.ts` - X API wrapper (post, like, retweet)
- `apps/api/src/routes/drafts.ts` - Draft CRUD + approval workflow
- `apps/api/src/routes/publish.ts` - Secure publishing endpoint
- `apps/api/src/routes/x-auth.ts` - Full OAuth lifecycle

### Bot
- `apps/bot/src/index.ts` - All Telegram commands + handlers

### Mini App
- `apps/miniapp/src/lib/api.ts` - API client with auth headers
- `apps/miniapp/src/lib/telegram.ts` - WebApp SDK wrapper
- `apps/miniapp/src/pages/*.tsx` - All UI pages

### Shared
- `packages/shared/src/types/index.ts` - TypeScript types (User, Draft, etc)
- `packages/shared/src/utils/crypto.ts` - Telegram verify + token crypto

---

## 🚀 Deployment Files

- `docker-compose.yml` - Full stack: DB, Redis, API, Bot
- `.env.example` - All required env variables
- `SETUP.md` - Railway, Docker, VPS deployment guides

---

## 🎯 What's Included (MVP)

✅ Full Telegram Bot with all commands  
✅ React Mini App with 4 pages  
✅ Express API with 4 route modules  
✅ PostgreSQL database with Prisma  
✅ X OAuth 2.0 with PKCE flow  
✅ Token encryption/decryption  
✅ Draft management + approval workflow  
✅ Tweet publishing endpoint  
✅ Analytics tracking  
✅ Watchlist support (schema ready)  
✅ Activity logging  
✅ Telegram Mini App auth verification  
✅ Dark UI optimized for mobile  
✅ Docker Compose setup  
✅ Comprehensive docs  

---

## 🔮 Future Enhancements

Phase 2:
- AI draft suggestions (OpenAI/Claude)
- Watchlist monitoring
- Team mode
- Content calendar

Phase 3:
- Multiple X accounts
- Batch scheduling
- Analytics dashboard
- Custom workflows

---

## 📞 Support

See README.md, SETUP.md, or FIRST_RUN.md for help.

Questions? Check logs:
```bash
npm run dev  # All services
# or individually:
npm run dev -w apps/api
npm run dev -w apps/bot
npm run dev -w apps/miniapp
```

---

**Built with ❤️ for safe, responsible X engagement**
