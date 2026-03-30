# 🔄 Continuous Deployment Workflow

Once your code is on GitHub and Railway is connected, every push auto-deploys!

---

## Quick Workflow for Updates

### Make Local Changes

```powershell
cd C:\Users\windows\Desktop\telegram-x-assistant

# Edit your files (e.g., update a feature in apps/api/src/routes/drafts.ts)
# Or: npm install (to add new package)
```

### Commit & Push to GitHub

```powershell
# Stage all changes
git add .

# Commit with a message
git commit -m "Add feature: better error handling for drafts"

# Push to main branch
git push origin main
```

---

## What Happens Next (Auto):

1. ✅ GitHub receives your commit
2. ✅ Railway webhook triggers
3. ✅ Railway pulls latest code from `charry99/telegram-x-assistant`
4. ✅ Railway rebuilds API service (`npm start -w apps/api`)
5. ✅ Railway rebuilds Bot service (`npm start -w apps/bot`)
6. ✅ Database migrations run (if schema changed)
7. ✅ New versions live in ~2-3 minutes

**Zero downtime!** Railway handles rolling deployments.

---

## Check Deployment Status

### Via Railway Dashboard:

1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Click your project
3. Click `api-service` → **"Deployments"** tab
4. See real-time build logs
5. Once status = ✅ **Running**, you're live

### Via Railway CLI:

```powershell
# View logs in real-time
railway logs --service api-service -f

# View bot logs
railway logs --service bot-service -f

# Check deployment status
railway status
```

---

## Common Update Scenarios

### Adding a New API Endpoint

```powershell
# 1. Edit file
code apps/api/src/routes/new-feature.ts

# 2. Test locally (optional)
npm run dev -w apps/api

# 3. Commit and push
git add .
git commit -m "Add new endpoint: GET /api/new-feature"
git push origin main

# 4. Railway auto-deploys to production ✅
```

### Updating Database Schema

```powershell
# 1. Edit prisma schema
code prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_new_field

# 3. This auto-commits schema changes
git push origin main

# 4. Railway runs migration on deploy ✅
```

### Installing New Package

```powershell
# 1. Add package
npm install axios -w apps/api

# 2. Use it in code
# ... import axios in your file

# 3. Commit and push
git add .
git commit -m "Add axios for external API calls"
git push origin main

# 4. Railway installs dependency on deploy ✅
```

---

## Viewing Live Changes

After push completes:

1. **API**: `https://api-service-xxxxx.railway.app/health` should respond
2. **Bot**: Check Telegram bot for `/start` command
3. **Mini App**: (Separately hosted on Vercel, needs separate commit)

---

## Rollback If Something Breaks

### Revert Last Commit:

```powershell
git revert HEAD --no-edit
git push origin main

# Railway redeploys previous stable version
```

### Or View Previous Deployments:

```powershell
# In Railway dashboard:
# 1. Click api-service → Deployments
# 2. Find previous good build
# 3. Click "Redeploy" button
```

---

## Mini App Updates (Vercel)

Mini App is hosted on Vercel but **also** watches your GitHub repo!

```powershell
# Make changes to Mini App
code apps/miniapp/src/pages/Dashboard.tsx

# Commit and push
git add .
git commit -m "Improve Dashboard UI"
git push origin main

# Vercel auto-builds and deploys!
# https://telegram-x-assistant.vercel.app updated in ~1-2 minutes
```

---

## Branch Strategy (Optional But Recommended)

For safer deployments:

### Create Feature Branch:

```powershell
# Create new branch for feature
git checkout -b feature/draft-improvements

# Make changes
code apps/api/src/routes/drafts.ts

# Commit locally (doesn't deploy yet)
git add .
git commit -m "Improve draft approval workflow"

# Push feature branch
git push origin feature/draft-improvements

# Go to GitHub → Create Pull Request
# Review, test, then merge to main
# Merge auto-triggers Railway deploy ✅
```

---

## Environment Variables

For sensitive variables (bot tokens, API keys):

### Update in Railway (Not in Code):

1. Go to Railway dashboard
2. Click `api-service` → **"Variables"** tab
3. Update: `TELEGRAM_BOT_TOKEN=new_token`
4. Railway redeploys automatically ✅

**Never commit tokens to GitHub!**

---

## Monitoring Production

### Real-Time Logs:

```powershell
# Watch API logs
railway logs --service api-service -f

# Watch Bot logs  
railway logs --service bot-service -f
```

### Error Alerts:

Railway sends email if:
- Deployment fails
- Service crashes
- Memory/CPU issues

---

## Troubleshooting Deployments

### Build Failed - What to Do:

```powershell
# 1. Check logs
railway logs --service api-service

# 2. Look for error (e.g., missing dependency)
# 3. Fix locally
npm install missing-package

# 4. Commit and push
git add .
git commit -m "Fix: install missing package"
git push origin main

# 5. Railway retries automatically
```

### Service Crashing After Deploy:

```powershell
# 1. Check logs for error
railway logs --service api-service -f

# 2. Common issues:
#    - Database connection string wrong
#    - Missing environment variable
#    - Syntax error in code

# 3. Fix and push
git push origin main

# 4. Railway auto-redeploys
```

---

## Performance Tips

### Faster Deploys:

- Use `.gitignore` to exclude `node_modules/` and `dist/`
- Only push necessary files
- Avoid large binary files

### Check Current `.gitignore`:

```powershell
cat .gitignore
```

---

## Summary Workflow

```
1. Make code changes locally
2. Test with: npm run dev
3. Commit: git add . && git commit -m "message"
4. Push: git push origin main
5. ← Railway auto-deploys (2-3 min)
6. Check logs: railway logs --service api-service -f
7. Verify live: open dashboard, test bot, check errors
8. Done! No manual deploy needed 🚀
```

---

## Quick Commands Reference

```powershell
# Check git status
git status

# View commit history
git log --oneline -5

# See what files changed
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Push all commits
git push origin main

# Pull latest from GitHub
git pull origin main
```

---

## Next: Monitor Your Live Bot

Your system is now:
- ✅ **Code**: On GitHub (auto-syncs)
- ✅ **API + Bot**: On Railway (auto-deploys)
- ✅ **Mini App**: On Vercel (auto-deploys)
- ✅ **Database**: PostgreSQL on Railway

**You're production-ready!** 🎉

Any changes you push to GitHub instantly go live within minutes.

---

For questions about Railway: [docs.railway.app](https://docs.railway.app)
For Vercel: [vercel.com/docs](https://vercel.com/docs)
