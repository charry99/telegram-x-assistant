# 🚀 Local & Non-Docker Setup Guide

Run X Assistant **without Docker** — just Node.js + PostgreSQL locally or on any server.

---

## Table of Contents

1. [Local Development (No Docker)](#local-development-no-docker)
2. [Deploy with systemd (Linux)](#deploy-with-systemd-linux)
3. [Deploy with PM2](#deploy-with-pm2)
4. [Deploy to Heroku](#deploy-to-heroku)
5. [Deploy to Railway (No Docker needed)](#deploy-to-railway-no-docker-needed)
6. [Manual VPS Setup](#manual-vps-setup)

---

## Local Development (No Docker)

### Prerequisites

```bash
# Check you have these:
node --version  # Should be 18+
npm --version
psql --version  # PostgreSQL client
```

### Step 1: Install PostgreSQL Locally

#### macOS (Homebrew)
```bash
brew install postgresql
brew services start postgresql
createdb telegram_x_assistant
```

#### Windows
- Download PostgreSQL from postgresql.org
- Run installer (remember your password!)
- Use pgAdmin to create database `telegram_x_assistant`

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres createdb telegram_x_assistant
```

### Step 2: Setup Environment

```bash
cd telegram-x-assistant
cp .env.example .env
nano .env  # Edit with your tokens
```

Fill in:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret
DATABASE_URL=postgresql://postgres:password@localhost:5432/telegram_x_assistant
MINI_APP_URL=http://localhost:5173
API_BASE_URL=http://localhost:3000
ENCRYPTION_KEY=generate_with_node_command
NODE_ENV=development
PORT=3000
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Setup Database

```bash
# Create tables
npx prisma db push

# View data (optional)
npx prisma studio
```

### Step 5: Run All Services

**Option A: All in one command**
```bash
npm run dev
```

**Option B: Three separate terminals**

Terminal 1:
```bash
npm run dev -w apps/api
# Should show: "API running on port 3000"
```

Terminal 2:
```bash
npm run dev -w apps/bot
# Should show: "Telegram bot started"
```

Terminal 3:
```bash
npm run dev -w apps/miniapp
# Should show: "ready in ... ms"
# Visit: http://localhost:5173
```

### Step 6: Test

1. Open Telegram → find your bot
2. Send `/start`
3. Check logs for success

---

## Deploy with systemd (Linux)

Perfect for **affordable VPS** (DigitalOcean, Linode, Hetzner).

### Step 1: Rent VPS

```
Cost: $5-12/month
Provider: DigitalOcean, Linode, Hetzner, Vultr
OS: Ubuntu 22.04 LTS
```

### Step 2: SSH into Server

```bash
ssh root@your-server-ip
```

### Step 3: Install Node & PostgreSQL

```bash
# Update system
apt-get update && apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database
sudo -u postgres createdb telegram_x_assistant
```

### Step 4: Clone & Setup

```bash
# Clone repo
git clone <your-repo-url>
cd telegram-x-assistant

# Install deps
npm install

# Create .env
nano .env
# Paste your config

# Setup DB
npx prisma db push
```

### Step 5: Create systemd Services

#### `/etc/systemd/system/x-assistant-api.service`

```ini
[Unit]
Description=X Assistant API
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/telegram-x-assistant
Environment="NODE_ENV=production"
Environment="PORT=3000"
EnvironmentFile=/root/telegram-x-assistant/.env
ExecStart=/usr/bin/npm start -w apps/api
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### `/etc/systemd/system/x-assistant-bot.service`

```ini
[Unit]
Description=X Assistant Bot
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/telegram-x-assistant
Environment="NODE_ENV=production"
EnvironmentFile=/root/telegram-x-assistant/.env
ExecStart=/usr/bin/npm start -w apps/bot
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Step 6: Start Services

```bash
# Enable and start API
systemctl daemon-reload
systemctl enable x-assistant-api
systemctl start x-assistant-api

# Enable and start Bot
systemctl enable x-assistant-bot
systemctl start x-assistant-bot

# Check status
systemctl status x-assistant-api
systemctl status x-assistant-bot

# View logs
journalctl -u x-assistant-api -f
journalctl -u x-assistant-bot -f
```

### Step 7: Setup Nginx & HTTPS

```bash
# Install Nginx
apt-get install -y nginx certbot python3-certbot-nginx

# Create Nginx config
nano /etc/nginx/sites-available/default
```

Paste this config:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Mini App (separate)
    location / {
        root /root/telegram-x-assistant/apps/miniapp/dist;
        try_files $uri /index.html;
    }
}
```

Enable HTTPS:
```bash
certbot certonly --standalone -d your-domain.com
systemctl reload nginx
```

### Step 8: Build & Deploy Mini App

```bash
cd apps/miniapp
npm run build
# Creates dist/ folder

# Copy to web root
cp -r dist /var/www/html/miniapp
```

### Step 9: Update `.env` for Production

```env
TELEGRAM_BOT_TOKEN=your_token
X_CLIENT_ID=your_client_id
X_CLIENT_SECRET=your_client_secret
X_REDIRECT_URI=https://your-domain.com/api/x-auth/callback
DATABASE_URL=postgresql://postgres:password@localhost:5432/telegram_x_assistant
API_BASE_URL=https://api.your-domain.com
MINI_APP_URL=https://your-domain.com
NODE_ENV=production
PORT=3000
```

---

## Deploy with PM2

Easy process manager for Node.js apps.

### Step 1: Install PM2 Globally

```bash
npm install -g pm2
```

### Step 2: Create `ecosystem.config.js`

```bash
cd telegram-x-assistant
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "x-assistant-api",
      script: "apps/api/src/index.ts",
      cwd: "./",
      interpreter: "tsx",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "x-assistant-bot",
      script: "apps/bot/src/index.ts",
      cwd: "./",
      interpreter: "tsx",
      instances: 1,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
EOF
```

### Step 3: Start with PM2

```bash
# Install tsx globally (runs TS directly)
npm install -g tsx

# Start all apps
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs

# Setup auto-restart on reboot
pm2 startup
pm2 save

# Stop/restart
pm2 stop all
pm2 restart all
pm2 stop x-assistant-api
```

### Step 4: Monitor

```bash
# Real-time monitoring
pm2 monit

# Email alerts (optional)
pm2 install pm2-auto-pull
```

---

## Deploy to Heroku

Heroku handles servers for you.

### Step 1: Create Heroku Account

Go to [heroku.com](https://heroku.com) and sign up (free tier available).

### Step 2: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from heroku.com/download

# Linux
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
```

### Step 3: Login to Heroku

```bash
heroku login
```

### Step 4: Create Heroku Apps

```bash
# Create API app
heroku create x-assistant-api --buildpack heroku/nodejs

# Create Bot app
heroku create x-assistant-bot --buildpack heroku/nodejs
```

### Step 5: Add PostgreSQL Addon

```bash
# For API app
heroku addons:create heroku-postgresql:hobby-dev -a x-assistant-api
```

### Step 6: Create `Procfile`

```bash
cat > Procfile << 'EOF'
# For API dyno
web: npm start -w apps/api

# For Bot worker dyno
worker: npm start -w apps/bot
EOF
```

### Step 7: Deploy

```bash
# Set environment variables
heroku config:set TELEGRAM_BOT_TOKEN=your_token -a x-assistant-api
heroku config:set X_CLIENT_ID=your_client_id -a x-assistant-api
heroku config:set X_CLIENT_SECRET=your_client_secret -a x-assistant-api
heroku config:set ENCRYPTION_KEY=your_key -a x-assistant-api
heroku config:set X_REDIRECT_URI=https://x-assistant-api.herokuapp.com/api/x-auth/callback -a x-assistant-api

# Connect database
heroku config:set DATABASE_URL -a x-assistant-api
# (Heroku sets this automatically with Postgres addon)

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma db push -a x-assistant-api
```

### Step 8: View Logs

```bash
heroku logs -f -a x-assistant-api
heroku logs -f -a x-assistant-bot
```

---

## Deploy to Railway (No Docker Needed)

Railway is **easiest alternative to Docker**.

### Step 1: Create Railway Account

Go to [railway.app](https://railway.app) and sign up (free tier).

### Step 2: Connect GitHub Repo

1. Click "New Project"
2. Select "Deploy from GitHub"
3. Connect your GitHub account
4. Select your repo

### Step 3: Add Services

**1. PostgreSQL:**
- Click "+ New"
- Select "PostgreSQL"
- Railway creates it automatically

**2. Node.js API:**
- Click "+ New"
- Select "GitHub Repo"
- Select your repo branch
- Set start command: `npm start -w apps/api`

**3. Node.js Bot:**
- Click "+ New"
- Select "GitHub Repo"
- Set start command: `npm start -w apps/bot`

### Step 4: Set Environment Variables

For each service:
- Click service → "Variables"
- Add:
  ```
  TELEGRAM_BOT_TOKEN=your_token
  X_CLIENT_ID=your_client_id
  X_CLIENT_SECRET=your_client_secret
  DATABASE_URL=your_postgres_url
  NODE_ENV=production
  PORT=3000
  ```

### Step 5: Deploy Mini App to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy Mini App
cd apps/miniapp
vercel deploy
```

### Step 6: Update Redirects

- Update `X_REDIRECT_URI` to your Railway API domain
- Update `MINI_APP_URL` in bot to Vercel domain

**Done!** Everything runs without Docker.

---

## Manual VPS Setup (Full Control)

### Recommended: 2 Separate Machines

**Machine 1: API + Database**
- 2GB RAM, 20GB SSD
- Cost: $10/month
- Runs: API service

**Machine 2: Bot + Mini App**
- 1GB RAM, 10GB SSD
- Cost: $5/month
- Runs: Bot service + Static files

### Install & Run

On each machine:

```bash
# Install Node
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone <repo>
cd telegram-x-assistant
npm install

# Create .env
nano .env

# For API machine:
npm start -w apps/api

# For Bot machine:
npm start -w apps/bot
```

---

## Comparison Table

| Method | Cost | Ease | Scaling | Best For |
|--------|------|------|---------|----------|
| Local Dev | Free | ⭐⭐⭐⭐⭐ | N/A | Testing |
| systemd on VPS | $5-10/mo | ⭐⭐⭐ | Manual | Production |
| PM2 on VPS | $5-10/mo | ⭐⭐⭐⭐ | Manual | Production |
| Heroku | $7-50/mo | ⭐⭐⭐⭐ | Auto | Quick deploy |
| Railway | $5-20/mo | ⭐⭐⭐⭐⭐ | Auto | Easiest |
| 2 VPS | $15/mo | ⭐⭐ | Manual | Full control |

---

## Recommended Setup

**For Beginners:** Railway (easiest, free tier)

**For Production:** systemd on VPS (most control, cheapest)

**For Quick Testing:** Local development

---

## Troubleshooting

### PostgreSQL won't connect

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check connection
psql postgresql://postgres:password@localhost:5432/telegram_x_assistant

# Reset if needed
sudo -u postgres dropdb telegram_x_assistant
sudo -u postgres createdb telegram_x_assistant
```

### Port 3000 already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start -w apps/api
```

### Bot not responding

```bash
# Check logs
pm2 logs x-assistant-bot
# or
journalctl -u x-assistant-bot -f

# Restart
pm2 restart x-assistant-bot
# or
systemctl restart x-assistant-bot
```

### Database migrations fail

```bash
# Reset and retry
npx prisma migrate reset
npx prisma db push
```

---

## Questions?

- See main README.md
- Check FIRST_RUN.md for quick start
- Review logs for errors

**No Docker needed — all alternatives work equally well!** 🚀
