<<<<<<< HEAD
# Sauga Artisan Festival

A unified monorepo containing the marketing website and vendor application portal for the Sauga Artisan Festival.

## Architecture

```
artisan-fest-merged/
├── artifacts/
│   ├── api-server/   — Express 5 API + serves compiled React SPA in production
│   └── web/          — React 19 + Vite + Tailwind v4 frontend (SPA)
├── lib/
│   ├── db/           — Drizzle ORM schema + PostgreSQL client
│   ├── api-zod/      — Shared Zod schemas for API request/response types
│   └── api-client-react/ — Generated React Query hooks for API calls
├── .env.example      — Required environment variables
├── railway.json      — Railway deployment config
└── pnpm-workspace.yaml
```

**Routes:**
- `/` — Marketing landing page
- `/apply` — Vendor application form (submits to `POST /api/applications`)
- `/admin` — Password-protected admin portal (login, submissions table, charts, email template)
- `/api/*` — REST API

## Prerequisites

- Node.js 20+
- pnpm 9+
- A Supabase project (free tier works)

## Local Development Setup

### 1. Install dependencies

```bash
npm install -g pnpm   # if not already installed
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
|---|---|
| `PORT` | Dev server port (default `3000`) |
| `NODE_ENV` | Set to `development` |
| `DATABASE_URL` | PostgreSQL connection string from Supabase |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (Settings → API) |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket name (default `vendor-uploads`) |
| `ADMIN_PASSWORD` | Password for `/admin` portal — **required, no default** |
| `SESSION_SECRET` | Random 64-char string for HMAC tokens — **required, no default** |
| `RESEND_API_KEY` | Optional — enables confirmation emails |
| `EMAIL_FROM` | Optional — sender address for confirmation emails |

### 3. Create Supabase Storage bucket

In Supabase dashboard → Storage → New bucket:
- Name: `vendor-uploads`
- Public: **Yes** (required for public image URLs)

### 4. Push database schema

```bash
pnpm run db:push
```

This creates the `vendor_applications` and `email_settings` tables.

### 5. Run locally

```bash
# Option A: run api-server and Vite dev server separately (recommended for hot reload)

# Terminal 1 — API server
cd artifacts/api-server
PORT=3000 BASE_PATH=/ pnpm run build && pnpm run start

# Terminal 2 — Vite dev server (proxies /api to localhost:3000)
cd artifacts/web
PORT=5173 BASE_PATH=/ pnpm run dev
```

### 6. Build for production

```bash
PORT=3000 BASE_PATH=/ pnpm run build
```

This typechecks all packages, builds the React SPA to `artifacts/web/dist/public/`, and bundles the Express server to `artifacts/api-server/dist/index.mjs`.

## Deployment on Railway

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/artisan-fest.git
git push -u origin main
```

### 2. Create a new Railway project

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Select your repository
3. Railway auto-detects `railway.json` and runs the build

### 3. Add environment variables in Railway

In the Railway service → Variables, add all variables from `.env.example`:
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `ADMIN_PASSWORD` (use a strong password)
- `SESSION_SECRET` (use `openssl rand -hex 32` to generate)
- `NODE_ENV=production`
- `RESEND_API_KEY` (optional)
- `EMAIL_FROM` (optional)

Railway automatically injects `PORT` — do **not** set it manually.

### 4. Run database migration on Railway

After the first deploy, open a Railway shell and run:
```bash
pnpm run db:push
```

### 5. Connect your IONOS domain

1. In Railway → your service → Settings → Domains → Add Custom Domain
2. Enter your domain (e.g. `saugaartisanfest.ca`)
3. Railway provides a CNAME target (e.g. `your-service.up.railway.app`)
4. In IONOS DNS panel:
   - Add a `CNAME` record: `@` → `your-service.up.railway.app`
   - Or for a subdomain like `www`: `www` → `your-service.up.railway.app`
5. Railway automatically provisions an SSL certificate via Let's Encrypt

DNS propagation typically takes 5–30 minutes.

## Admin Portal

Visit `/admin` on your deployed URL. The password is whatever you set as `ADMIN_PASSWORD`.

Features:
- **Responses tab** — searchable table of all vendor applications, with detail drawer and per-application Excel export
- **Summary tab** — charts showing product category distribution, food vs non-food breakdown, applications by province
- **Email Settings tab** — configure the automatic confirmation email template (requires `RESEND_API_KEY`)

## Email Configuration

Confirmation emails are sent via [Resend](https://resend.com). To enable:

1. Create a free Resend account
2. Add and verify your sending domain
3. Generate an API key
4. Set `RESEND_API_KEY` and `EMAIL_FROM` in your environment variables
5. Configure the email template in the admin portal → Email Settings tab

Template variables: `{{firstName}}`, `{{lastName}}`, `{{emailAddress}}`, `{{businessName}}`
=======
# artisan-fest
>>>>>>> 5cb9e8cd10a074c4ad3434a3f39a688ffab59f43
