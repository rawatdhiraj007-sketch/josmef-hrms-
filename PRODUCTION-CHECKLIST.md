# 🚀 JOSMEF Production Readiness Checklist

Your goal: make JOSMEF production-grade for the first paying client (JOSMEF itself).

**Total cost: ~$30-50/month.** Total time: ~3-5 days.

---

## ✅ Phase 1: Reliable hosting (CRITICAL)

### 1. Upgrade Render backend plan
- **Why:** Free tier sleeps after 15 min idle → first request takes 30-60s. Unacceptable for a real user.
- **Cost:** $7/month (Starter) or $25/month (Standard, recommended for production)
- **How:**
  1. Go to https://dashboard.render.com/web/srv-d8bc5ihakrks73diiajg
  2. Settings → Plan → Upgrade to "Starter" ($7) or "Standard" ($25)
  3. Click "Confirm"

### 2. Upgrade Render PostgreSQL
- **Why:** Free PostgreSQL expires after 90 days, 1GB limit, no backups.
- **Cost:** $7/month (Starter, 256MB RAM, 1GB SSD, daily backups, persistent)
- **How:**
  1. Render dashboard → your database → Settings → Plan → "Starter"
  2. OR migrate to Supabase free tier (better — 500MB DB, 1GB file storage, daily backups, free forever):
     - Sign up at supabase.com
     - Create project → copy connection string
     - Update `DATABASE_URL` env var on Render
     - Trigger redeploy

### 3. Set up SMTP for email (notifications, applicant confirmations, password resets)
- **Why:** Email is broken right now — no SMTP env vars set.
- **Cost:** Free tier covers ~100 emails/day:
  - **Postmark:** 100/day free, $15/mo for 10K
  - **SendGrid:** 100/day free, $15/mo for 50K
  - **Mailgun:** 5000/mo free (3 months), then $35/mo

- **How (Postmark recommended):**
  1. Sign up at https://postmarkapp.com
  2. Create a "Server" → copy the "Server API Token"
  3. Add a verified sending domain (`josmef.com` or whatever)
  4. On Render env vars, add:
     ```
     SMTP_HOST=smtp.postmarkapp.com
     SMTP_PORT=587
     SMTP_USER=<your-server-token>
     SMTP_PASS=<same-server-token>
     SMTP_FROM=noreply@josmef.com
     ```
  5. Trigger redeploy

---

## ✅ Phase 2: Custom domain

### 4. Buy a domain
- **Cost:** ~$15-30/year
- **Recommended names:** `josmef.com`, `josmef.app`, `josmef.ph`
- **Where:** Namecheap, Cloudflare Registrar (cheapest), GoDaddy

### 5. Connect domain to Vercel (frontend)
- **How:**
  1. Vercel dashboard → Project → Settings → Domains → Add `app.josmef.com` (or `hr.josmef.com`)
  2. Add DNS records as instructed (CNAME → cname.vercel-dns.com)
  3. Wait ~10 min for SSL to provision
  4. Done — your app is at `app.josmef.com`

### 6. Connect domain to Render (backend)
- **How:**
  1. Render dashboard → service → Settings → Custom Domains → Add `api.josmef.com`
  2. Add DNS CNAME record as instructed
  3. Wait ~10 min for SSL
  4. Update `NEXT_PUBLIC_API_URL` env var on Vercel to `https://api.josmef.com/api/v1`
  5. Redeploy frontend

---

## ✅ Phase 3: Monitoring + reliability

### 7. Set up Sentry (error tracking)
- **Cost:** Free (5K errors/month)
- **Why:** When something breaks, you'll know within seconds + see exactly where.
- **How:**
  1. Sign up at sentry.io
  2. Create project (Node.js for backend, Next.js for frontend)
  3. Get DSN
  4. Backend: `npm install @sentry/node` + add init to main.ts
  5. Frontend: `npx @sentry/wizard@latest -i nextjs`

### 8. Set up UptimeRobot (status monitoring)
- **Cost:** Free
- **How:**
  1. Sign up at uptimerobot.com
  2. Add monitor: `https://api.josmef.com/healthz` every 5 min
  3. Add SMS / email alerts when down
  4. Get a public status page: `status.josmef.com`

### 9. Set up automated database backups
- **Why:** Backups are your nuclear safety net.
- **How (if on Render paid plan):** Automatic daily backups included.
- **How (if on Supabase):** Daily backups + point-in-time recovery automatic.
- **How (manual extra safety):** Render cron job to dump DB → S3 weekly

---

## ✅ Phase 4: Production polish

### 10. Disable demo auto-login
- **Why:** Auto-login as admin is great for testing, terrible for production.
- **How:** Edit `frontend/src/app/auth/login/page.tsx`:
  ```
  const TESTING_OPEN_MODE = false;  // change true → false
  ```
- Or pass via env var

### 11. Change default admin password
- **Why:** `Admin@2025` is in this codebase. Anyone with GitHub access can log in.
- **How:**
  1. Login as admin
  2. Settings / Profile → Change password
  3. Use a strong password (16+ chars)
  4. Also create a real super admin user with the client's email + delete the seeded one

### 12. Remove demo employee
- **How:**
  1. Edit `backend/src/seeds/seed.service.ts`
  2. Comment out the `seedDemoEmployee()` call
  3. Manually delete the user via DB or admin panel

### 13. Set up rate limiting
- **Why:** Public apply page is open — bots will spam it.
- **How:** Add `@nestjs/throttler` package:
  ```
  npm install @nestjs/throttler
  ```
  - Limit: 5 applications per IP per hour
  - Limit: 10 login attempts per IP per minute

---

## 💰 Total cost summary

| Item | Monthly | Annual |
|---|---|---|
| Render Starter (backend) | $7 | $84 |
| Render PostgreSQL Starter | $7 | $84 |
| Postmark SMTP | $0 (free tier) | $0 |
| Domain | $1.25 | $15 |
| Sentry | $0 (free tier) | $0 |
| UptimeRobot | $0 (free tier) | $0 |
| Supabase backups | $0 (free tier) | $0 |
| Vercel hosting | $0 (Hobby) | $0 |
| **TOTAL** | **~$15** | **~$183** |

**Upgrade later when JOSMEF outgrows free tiers:**
- Render Standard (better perf): +$18/mo
- Vercel Pro (team accounts): +$20/mo
- Postmark 10K emails: +$15/mo

---

## 🎯 Quick-start: today's actions

If you want JOSMEF live for one real user this week:

| Day | Action | Time |
|---|---|---|
| **Mon** | Buy domain + upgrade Render plan + add Postmark | 2 hours |
| **Tue** | Connect domain to Vercel + Render, update env vars | 1 hour |
| **Wed** | Set up Sentry + UptimeRobot | 1 hour |
| **Thu** | Disable demo login + change admin password + add rate limiting | 2 hours |
| **Fri** | End-to-end test as real user, demo to JOSMEF stakeholders | half day |

**By next Monday:** JOSMEF is live in production.

---

## 🤝 What I can do for you vs. what only you can do

| You (decisions + money) | Me (code) |
|---|---|
| Upgrade Render plan | Update env vars |
| Buy domain | Update DNS docs |
| Sign up for Postmark | Add SMTP config code |
| Sign up for Sentry | Wire Sentry into app |
| Sign up for UptimeRobot | — |
| Decide admin password | Disable demo login |

Tell me what you've done and I'll help with the technical side of each step.
