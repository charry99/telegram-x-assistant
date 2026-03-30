# 🚀 Deploy to Railway (Complete Guide)

Railway handles everything — PostgreSQL, API, Bot, no Docker needed.

---

## Table of Contents

1. [Create Railway Account](#create-railway-account)
2. [Deploy from GitHub](#deploy-from-github)
3. [Add PostgreSQL](#add-postgresql)
4. [Add API Service](#add-api-service)
5. [Add Bot Service](#add-bot-service)
6. [Set Environment Variables](#set-environment-variables)
7. [Run Database Migrations](#run-database-migrations)
8. [Verify Deployment](#verify-deployment)
9. [Update Telegram Config](#update-telegram-config)

---

## Create Railway Account

1. Go to **[railway.app](https://railway.app)**
2. Click **"Start Free"**
3. Sign up with GitHub (easiest — no need to verify email)
4. Authorize Railway to access your GitHub repos
5. You're done! Dashboard appears

---

## Deploy from GitHub

### Step 1: Create New Project

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub"**
3. Authorize Railway if prompted
4. Select your repo (e.g., `your-username/telegram-x-assistant`)
5. Click **"Deploy"**

Railway auto-detects Node.js project and deploys!

### Step 2: Wait for Initial Deploy

Should see:
```
✅ Building application...
✅ Deploying...
✅ Success! Your app is live
```

(Takes ~2-3 minutes)

---

## Add PostgreSQL

Railway detected Node.js but not your database. Let's add it:

### From Dashboard:

1. Click **"+ New"** button (top right)
2. Select **"Database"** → **"PostgreSQL"**
3. Railway provisions PostgreSQL automatically
4. It's automatically connected to your project!

You should see in dashboard:
```
📦 telegram-x-assistant (GitHub repo)
  ├─ yourapp-abc123 (Node.js)
  └─ postgresql-xyz (PostgreSQL 16)
```

---

## Add API Service

API needs its own service to run separately from the web deployment.

### Step 1: Create New Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select same repo (`telegram-x-assistant`)
3. Give it a name: `api-service`
4. Continue

### Step 2: Configure Service

Click on `api-service` in dashboard:

1. Click **"Settings"** tab
2. Scroll to **"Deploy"** section
3. Set **"Build Command"**:
   ```
   npm install && npm run build:shared
   ```

4. Set **"Start Command"**:
   ```
   npm start -w apps/api
   ```

5. Set **"Port"**: `3000`

6. Click **"Save"**

---

## Add Bot Service

Bot also runs separately.

### Step 1: Create New Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select same repo
3. Name: `bot-service`
4. Continue

### Step 2: Configure Service

Click on `bot-service`:

1. **Settings** tab
2. **Build Command**: `npm install && npm run build:shared`
3. **Start Command**: `npm start -w apps/bot`
4. **Save**

---

## Set Environment Variables

Each service needs access to environment variables.

### For PostgreSQL Service:

No action needed — Railway auto-creates `DATABASE_URL`.

### For API Service:

1. Click `api-service` → **"Variables"** tab
2. Click **"+ New Variable"**
3. Add these:

| Variable | Value |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | Your bot token from @BotFather |
| `X_CLIENT_ID` | From developer.twitter.com |
| `X_CLIENT_SECRET` | From developer.twitter.com |
| `X_REDIRECT_URI` | `https://api-service-xxxxx.railway.app/api/x-auth/callback` |
| `DATABASE_URL` | Click **"Reference"** → select PostgreSQL |
| `ENCRYPTION_KEY` | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `API_BASE_URL` | `https://api-service-xxxxx.railway.app` |
| `MINI_APP_URL` | `https://telegram-x-assistant.vercel.app` |

**How to reference PostgreSQL:**
- In the value field, type `${{Postgres.DATABASE_URL}}`
- Railway auto-replaces with actual connection string

### For Bot Service:

1. Click `bot-service` → **"Variables"** tab
2. Add these:

| Variable | Value |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | Same as API |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `NODE_ENV` | `production` |
| `API_BASE_URL` | `https://api-service-xxxxx.railway.app` |

---

## Run Database Migrations

Prisma needs to create tables in PostgreSQL.

### Option 1: Via Railway CLI (Easiest)

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Connect to your project
railway login --browserless

# Run migration
railway run npx prisma db push
```

### Option 2: Via Railway Dashboard

1. Click `api-service` → **"Deployments"** tab
2. Click latest deployment's hash
3. Scroll to **"Logs"** 
4. Click **"Open Logs"** → **"Terminal"**
5. Run:
   ```bash
   npx prisma db push
   ```

### Verify Migration

You should see:
```
✔ Database synced successfully
```

---

## Verify Deployment

Check all 3 services are running:

1. **API Service**
   - Click `api-service` → **"Deployments"**
   - Status should be ✅ **Running**
   - Click **"View Logs"** → should show `API running on port 3000`

2. **Bot Service**
   - Click `bot-service` → **"Deployments"**
   - Status should be ✅ **Running**
   - Logs should show `Telegram bot started`

3. **PostgreSQL**
   - Click `PostgreSQL` → **"Data"** tab
   - Should show connection details

---

## Find Your Service URLs

### API URL:

1. Click `api-service` → **"Settings"**
2. Under **"Railway Provided Domain"**, copy the URL
3. Example: `https://api-service-production-xxxxx.railway.app`

### Bot (Internal Only)

Bot doesn't need a public URL — it works via Telegram.

### Mini App:

Already deployed to Vercel:
- Example: `https://telegram-x-assistant.vercel.app`

---

## Update Telegram Config

Go back to @BotFather in Telegram:

### 1. Set Webhook (if using webhook instead of polling)

```
/setcommandscope
/setcommands
/setdefaultadministratorights
```

Or just use polling (already configured) — no changes needed.

### 2. Update Mini App Button

In your Telegram bot settings:
- Go to Bot Settings → Menu Button
- Set to: `https://telegram-x-assistant.vercel.app`

---

## Update Your Local .env

For any local testing, update with Railway URLs:

```env
TELEGRAM_BOT_TOKEN=your_token
X_CLIENT_ID=your_client_id
X_CLIENT_SECRET=your_client_secret
X_REDIRECT_URI=https://api-service-xxxxx.railway.app/api/x-auth/callback
DATABASE_URL=postgresql://...@...
MINI_APP_URL=https://telegram-x-assistant.vercel.app
API_BASE_URL=https://api-service-xxxxx.railway.app
NODE_ENV=production
PORT=3000
```

---

## Test End-to-End

### 1. Test Bot

```
Open Telegram → Your Bot → /start
```

Should reply with welcome message ✅

### 2. Test Mini App

```
Click "Open Dashboard" button
Should load: https://telegram-x-assistant.vercel.app
```

### 3. Test API

```powershell
$headers = @{
    "X-Init-Data" = "your_telegram_init_data"
    "Authorization" = "Bearer your_token"
}

curl -Uri "https://api-service-xxxxx.railway.app/health" -Headers $headers
```

Should return: `{ "status": "ok" }`

---

## Monitor Your Services

### View Real-Time Logs

```powershell
# API logs
railway logs --service api-service

# Bot logs
railway logs --service bot-service

# Follow logs (live updates)
railway logs --service api-service -f
```

### View Usage & Resources

In Railway dashboard:
1. Click each service
2. **"Metrics"** tab shows:
   - CPU usage
   - Memory usage
   - Network throughput
   - Cost so far

### Auto-Scale (Optional)

If API gets >100k requests/month, Railway auto-scales. You only pay for what you use.

---

## Troubleshooting

### Bot not responding

```powershell
# Check bot service
railway logs --service bot-service -f

# Common issue: TELEGRAM_BOT_TOKEN not set
# Go to bot-service → Variables → confirm token exists
```

### Mini App shows "Cannot connect to API"

```
1. Check API_BASE_URL in Railway dashboard
2. Confirm X-Init-Data header is being sent
3. Check api-service logs for auth errors
```

### Database migration failed

```powershell
# SSH into railway and check
railway shell --service api-service

# Run migration manually
npx prisma db push

# If tables already exist:
npx prisma db push --skip-generate
```

### Vercel Mini App can't reach Railway API

```
1. Confirm X_REDIRECT_URI includes your Railway URL
2. Test API endpoint directly: curl https://api-service-xxxxx.railway.app/health
3. Check CORS settings in apps/api/src/index.ts
```

---

## Pricing

Railway's free tier includes:

- **$5 free credits/month** (plenty for testing)
- **PostgreSQL**: Included in free tier
- **Each Node.js service**: ~0.50/month after free credits
- **Pay only for what you use** — no surprise charges

Your stack monthly cost:
- PostgreSQL: Free
- API service: ~$1-5/month
- Bot service: ~$0.50-2/month
- **Total: ~$2-7/month** (way cheaper than Heroku!)

---

## Next Steps

1. ✅ Deploy to Railway (API + Bot + Database)
2. ✅ Deploy Mini App to Vercel
3. Test everything works
4. Add custom domain (optional):
   - Go to service → **Settings** → **Custom Domain**
   - Add your domain, update DNS records
5. Monitor logs for issues
6. Celebrate! 🎉

---

## Quick Reference

| Service | URL | Status Check |
|---------|-----|------|
| API | `https://api-service-xxxxx.railway.app` | `GET /health` |
| Bot | (Internal) | Check logs |
| Mini App | `https://telegram-x-assistant.vercel.app` | Open in browser |
| PostgreSQL | (Internal) | Check Rails data tab |

---

**Your bot is now live!** Users can find it on Telegram and use the Mini App globally. 🌍

Questions? Check the logs or reach out!
