# 🚀 Setup Guide - X Assistant

Complete step-by-step setup for getting the full system running locally and for production.

---

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Telegram Bot Configuration](#telegram-bot-configuration)
3. [X (Twitter) OAuth Setup](#x-twitter-oauth-setup)
4. [Database Setup](#database-setup)
5. [Running Locally](#running-locally)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

Make sure you have installed:

- **Node.js 18+** ([download](https://nodejs.org))
- **PostgreSQL 14+** ([download](https://www.postgresql.org/download/))
- **Git** ([download](https://git-scm.com))

### Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd telegram-x-assistant
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (monorepo)
npm install

# Or use yarn
yarn install
```

### Step 3: Create Environment File

```bash
# Copy the template
cp .env.example .env

# Edit with your values
nano .env  # or code .env
```

Leave most values as-is for now, we'll fill them in the next sections.

---

## Telegram Bot Configuration

### Create Your Bot with BotFather

1. **Open Telegram** and find [@BotFather](https://t.me/botfather)

2. **Send `/newbot`** and follow the prompts:
   - Name: `X Assistant` (or your preferred name)
   - Username: `x_assistant_bot` (must be unique)

3. **Copy the token** BotFather sends you
   - Format: `123456789:ABCdefGHIjklMNOpqrSTUvwxYZ`

### Add Bot to Your Telegram

```bash
# Visit this URL (replace token):
https://t.me/x_assistant_bot?start=setup

# or search for @x_assistant_bot in Telegram
```

### Set Bot Commands

```bash
# In BotFather, send:
/setcommands

# Then select your bot (@x_assistant_bot)

# Send commands in this format:
start - Welcome & dashboard
dashboard - Open mini app
stats - Today's metrics
queue - Pending drafts
settings - Configure bot
help - Show help
```

### Update `.env` File

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
```

---

## X (Twitter) OAuth Setup

### Create X Developer Account

1. **Go to** [developer.twitter.com/en/portal/dashboard](https://developer.twitter.com/en/portal/dashboard)

2. **Sign in** with your X account (create one if needed)

3. **Apply for Developer Access**:
   - Choose: "Building tools and apps"
   - Use case: "Social media engagement tool"
   - Features: "Enable bot auth flow"

4. **Wait for approval** (usually 5-30 mins)

### Create OAuth App

Once approved:

1. **Create an app** in Developer Portal:
   - Name: `X Assistant`
   - Type: `Web App` (or Automated App)

2. **Go to "Settings" → "User authentication settings"**:
   - Enable OAuth 2.0
   - App type: "Web app, Automated App or Bot"
   - **Callback URL** (required for local dev):
     ```
     http://localhost:3000/api/x-auth/callback
     ```
   - **Website URL**:
     ```
     http://localhost:5173
     ```
   - **Terms**:
     ```
     http://localhost:3000/terms
     ```
   - **Privacy Policy**:
     ```
     http://localhost:3000/privacy
     ```

3. **Request Scopes**:
   - ✅ `tweet.read`
   - ✅ `tweet.write`
   - ✅ `users.read`
   - ✅ `follows.read`
   - ✅ `follows.write`
   - ✅ `offline.access`

4. **Copy Credentials**:
   - Client ID
   - Client Secret

### Update `.env` File

```env
X_CLIENT_ID=your_client_id_here
X_CLIENT_SECRET=your_client_secret_here
X_REDIRECT_URI=http://localhost:3000/api/x-auth/callback
```

### For Production

When deploying, update:

```env
# Production Redirect URI
X_REDIRECT_URI=https://your-domain.com/api/x-auth/callback

# Update Website/Terms/Privacy URLs in X Developer Portal too
```

---

## Database Setup

### Local PostgreSQL

#### Option A: Using Homebrew (macOS)

```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database
createdb telegram_x_assistant

# Verify connection
psql telegram_x_assistant
```

#### Option B: Using Docker

```bash
# Start PostgreSQL container
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16-alpine

# Create database
docker exec postgres createdb -U postgres telegram_x_assistant

# Verify
docker exec postgres psql -U postgres -l
```

#### Option C: Windows

- Download PostgreSQL installer
- Run installer
- Note: username=`postgres`, password=(what you set)
- Create database through pgAdmin

### Update `.env`

```env
# Local PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/telegram_x_assistant

# With Docker
DATABASE_URL=postgresql://postgres:password@db:5432/telegram_x_assistant

# Remote (e.g., Supabase)
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Check database
npx prisma studio  # Opens UI to view/edit data
```

---

## Running Locally

### Final `.env` Check

Your `.env` should look like:

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_token

# X
X_CLIENT_ID=your_client_id
X_CLIENT_SECRET=your_client_secret
X_REDIRECT_URI=http://localhost:3000/api/x-auth/callback

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/telegram_x_assistant

# URLs
API_BASE_URL=http://localhost:3000
MINI_APP_URL=http://localhost:5173

# Encryption (generate one):
ENCRYPTION_KEY=generate_a_random_32_char_hex

# Environment
NODE_ENV=development
PORT=3000
```

**Generate encryption key:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Start Services

#### Option A: All at Once

```bash
npm run dev

# This starts:
# - API on http://localhost:3000
# - Bot (listening for commands)
# - Mini App on http://localhost:5173
```

#### Option B: Separate Terminals

```bash
# Terminal 1: API
npm run dev -w apps/api

# Terminal 2: Bot
npm run dev -w apps/bot

# Terminal 3: Mini App
npm run dev -w apps/miniapp
```

### Test It

1. **Open Telegram** and find your bot (`@x_assistant_bot`)

2. **Send `/start`**
   - Should see welcome message and buttons

3. **Send `/stats`**
   - Should see today's metrics

4. **Click "Open Dashboard"**
   - Should open Mini App (http://localhost:5173)

5. **In Mini App:**
   - Go to "Settings"
   - Click "Connect X Account"
   - Should redirect to X login
   - After approval, should show "✅ Connected"

### Check Logs

```bash
# API logs
npm run dev -w apps/api
# Look for: "API running on port 3000"

# Bot logs  
npm run dev -w apps/bot
# Look for: "Telegram bot started"

# Mini App logs
npm run dev -w apps/miniapp
# Look for: "VITE v... ready in ... ms"
```

---

## Deployment

### Prerequisites

- Registered domain (e.g., example.com)
- SSL certificate (free from Let's Encrypt)
- Hosting provider (Railway, Render, DigitalOcean, etc.)
- PostgreSQL instance (managed)

### Step 1: Prepare Production `.env`

```env
# Production Telegram
TELEGRAM_BOT_TOKEN=your_production_token
# (create new bot for production)

# Production X
X_CLIENT_ID=production_client_id
X_CLIENT_SECRET=production_client_secret
X_REDIRECT_URI=https://your-domain.com/api/x-auth/callback

# Production Database
DATABASE_URL=postgresql://user:pass@host:port/dbname
# Use managed database (Supabase, AWS RDS, etc.)

# Production URLs
API_BASE_URL=https://api.your-domain.com
MINI_APP_URL=https://your-domain.com

# Secure encryption
ENCRYPTION_KEY=generate_new_secure_key

NODE_ENV=production
PORT=3000
```

### Deploy Option 1: Railway (Easiest)

1. **Connect GitHub:**
   - Go to [railway.app](https://railway.app)
   - Connect your repo

2. **Add Services:**
   - PostgreSQL (managed)
   - API (Dockerfile)
   - Bot (Dockerfile)
   - Mini App (static Vercel)

3. **Set Environment Variables:**
   - For each service, add `.env` values

4. **Deploy:**
   - Push to main branch
   - Railway auto-deploys

### Deploy Option 2: Docker Compose

1. **Build images:**
   ```bash
   docker build -f apps/api/Dockerfile -t api:latest .
   docker build -f apps/bot/Dockerfile -t bot:latest .
   ```

2. **Push to registry:**
   ```bash
   # If using Docker Hub:
   docker tag api:latest your-username/api:latest
   docker push your-username/api:latest
   ```

3. **Run on server:**
   ```bash
   docker-compose up -d
   ```

### Deploy Option 3: Traditional VPS

1. **Rent VPS** (DigitalOcean: $12/month)

2. **SSH in and run:**
   ```bash
   # Install Node
   curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs postgresql

   # Clone repo
   git clone <repo>
   cd telegram-x-assistant
   npm install
   npm run build

   # Set .env
   nano .env

   # Run
   npm start
   ```

3. **Setup Nginx** reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location /api/ {
           proxy_pass http://localhost:3000;
       }

       location / {
           proxy_pass http://localhost:5173;
       }
   }
   ```

4. **Enable HTTPS:**
   ```bash
   sudo apt-get install certbot
   sudo certbot certonly --standalone -d your-domain.com
   ```

### Post-Deployment

1. **Update X Developer Portal:**
   - Callback URI: `https://your-domain.com/api/x-auth/callback`
   - Website: `https://your-domain.com`

2. **Create Production Bot:**
   - Use @BotFather `/newbot`
   - Different token for production
   - Recommendations in /setcommands

3. **Test Production:**
   - Open Telegram → find new bot
   - Test all commands
   - Connect X account
   - Create and publish draft

---

## Troubleshooting

### "Cannot find module @telegram-x-assistant/shared"

```bash
# Rebuild workspace
npm install

# Or try:
npm run build -ws
```

### "DATABASE_URL is invalid"

```bash
# Check PostgreSQL is running:
psql postgres  # should connect

# Verify DATABASE_URL format:
postgresql://user:password@host:port/dbname

# Test connection:
psql $DATABASE_URL
```

### "X OAuth redirect fails"

1. Check Redirect URI matches exactly in:
   - X Developer Portal
   - `.env` file

2. Domain must be HTTPS (not http://localhost)
   - For production only

### "Mini App doesn't show in Telegram"

1. Verify Mini App URL is HTTPS
2. Check bot webhook is configured correctly
3. Try `/start` command again
4. Clear Telegram cache

### "Tokens expired after deployment"

All good! System handles token refresh automatically.
- Check `xOAuthService.decryptToken()` in logs
- Ensure ENCRYPTION_KEY hasn't changed

### "Bot not responding"

1. Verify bot is running
   ```bash
   npm run dev -w apps/bot
   ```

2. Check TELEGRAM_BOT_TOKEN is correct

3. Restart bot service

### "Database migrations fail"

```bash
# Reset and try again:
npx prisma migrate reset

# Or push fresh:
npx prisma db push --force-reset
```

---

## Next Steps

After setup is complete:

1. ✅ **Test all features** in dashboard
2. ✅ **Create test X account** for posting
3. ✅ **Monitor logs** for issues
4. ✅ **Set up alerts** for errors
5. ✅ **Review security** settings
6. ✅ **Consider backups** if production

---

**Questions?** Check logs, search "telegram-x-assistant" issues, or review the main README.
