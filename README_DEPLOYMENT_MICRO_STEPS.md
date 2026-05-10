# SmartBank Financial Health Score™ — Micro-Step Deployment Guide

This guide starts from the beginning and assumes you are using Windows, Visual Studio Code, GitHub, Supabase and Vercel.

## What you are deploying
A working Next.js 14 + TypeScript + Tailwind app with:

- SmartBank Financial Health Score™ dashboard
- Explainable 0–100 scoring model
- `/api/score` API endpoint
- Supabase Postgres schema and RLS policies
- OpenAPI docs
- Jest and Playwright tests
- Optional Express backend for local Node/Express testing

---

## Part A — Install tools on your computer

### A1. Install Node.js
1. Go to Google.
2. Search: `Node.js download`.
3. Open the official Node.js website.
4. Download the LTS version.
5. Install it.
6. Open Command Prompt.
7. Type:

```bash
node -v
npm -v
```

You should see version numbers.

### A2. Install Visual Studio Code
1. Go to Google.
2. Search: `Visual Studio Code download`.
3. Open the official Microsoft VS Code website.
4. Download for Windows.
5. Install it.

### A3. Install Git
1. Go to Google.
2. Search: `Git for Windows download`.
3. Download Git.
4. Install it.
5. Open Command Prompt.
6. Type:

```bash
git --version
```

You should see a version number.

---

## Part B — Open the project in Visual Studio Code

1. Unzip `smartbank-health-score.zip`.
2. You will see a folder called `smartbank-health-score`.
3. Right-click the folder.
4. Click `Open with Code`.
5. In VS Code, click `Terminal` at the top.
6. Click `New Terminal`.
7. Paste:

```bash
npm install
```

8. Wait until installation finishes.
9. Paste:

```bash
copy .env.example .env.local
```

10. Start the app:

```bash
npm run dev
```

11. Open your browser.
12. Go to:

```text
http://localhost:3000
```

13. Click `Run API Score`.
14. You should see the dashboard and recommendations.

---

## Part C — Create Supabase project

1. Go to `supabase.com`.
2. Click `Start your project` or `Sign in`.
3. Sign in with GitHub or email.
4. Click `New project`.
5. Organisation: choose your default organisation.
6. Project name: `smartbank-health-score`.
7. Database password: create a strong password and save it somewhere safe.
8. Region: choose the nearest available region.
9. Click `Create new project`.
10. Wait until Supabase finishes creating the project.

### C1. Create tables and RLS policies
1. In Supabase left sidebar, click `SQL Editor`.
2. Click `New query`.
3. Go back to VS Code.
4. Open `supabase/schema.sql`.
5. Select all the SQL.
6. Copy it.
7. Go back to Supabase SQL Editor.
8. Paste it.
9. Click `Run`.
10. You should see success.

### C2. Copy Supabase keys
1. In Supabase left sidebar, click `Project Settings`.
2. Click `API`.
3. Find `Project URL`.
4. Copy it.
5. Open `.env.local` in VS Code.
6. Paste it after:

```bash
NEXT_PUBLIC_SUPABASE_URL=
```

7. In Supabase, copy the `anon public` key.
8. Paste it after:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

9. In Supabase, copy the `service_role` key.
10. Paste it after:

```bash
SUPABASE_SERVICE_ROLE_KEY=
```

Important: never put the service role key in frontend code or public screenshots.

---

## Part D — Push to GitHub

1. Go to `github.com`.
2. Sign in.
3. Click the `+` button at the top right.
4. Click `New repository`.
5. Repository name: `smartbank-health-score`.
6. Choose `Private` or `Public`.
7. Do not tick “Add a README”.
8. Click `Create repository`.
9. GitHub will show commands.
10. In VS Code terminal, paste these commands one by one:

```bash
git init
git add .
git commit -m "Initial SmartBank health score app"
git branch -M main
```

11. Copy your GitHub repository URL.
12. It will look like:

```text
https://github.com/YOUR_USERNAME/smartbank-health-score.git
```

13. Paste this, but replace the URL with your own:

```bash
git remote add origin https://github.com/YOUR_USERNAME/smartbank-health-score.git
git push -u origin main
```

14. Refresh GitHub.
15. You should see your code online.

---

## Part E — Deploy to Vercel

1. Go to `vercel.com`.
2. Sign in with GitHub.
3. Click `Add New...`.
4. Click `Project`.
5. You will see a list of GitHub repositories.
6. Find `smartbank-health-score`.
7. Click `Import`.
8. Framework Preset should say `Next.js`.
9. Root Directory should stay as `./`.
10. Build Command should be:

```bash
npm run build
```

11. Output Directory should be blank/default.
12. Install Command should be:

```bash
npm install
```

### E1. Add environment variables on Vercel
In the same Vercel import screen, find `Environment Variables`.

Add these one by one:

```bash
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Then click `Deploy`.

### E2. After deployment
1. Wait until Vercel says `Congratulations`.
2. Click `Visit`.
3. Your live app opens.
4. Click `Run API Score`.
5. The dashboard should calculate a score.

---

## Part F — Update code later

After editing files in VS Code, run:

```bash
git add .
git commit -m "Update SmartBank app"
git push
```

Vercel will automatically redeploy.

---

## Part G — Tests

Run unit tests:

```bash
npm test
```

Run browser tests:

```bash
npx playwright install
npm run test:e2e
```

Run local Express backend:

```bash
npm run server
```

Then test:

```text
http://localhost:4000/health
```

---

## Troubleshooting

### If localhost does not open
In VS Code terminal, make sure this is running:

```bash
npm run dev
```

### If `npm install` fails
Run:

```bash
node -v
```

You need Node 20 or newer.

### If Vercel build fails
1. Go to Vercel project.
2. Click `Deployments`.
3. Click the failed deployment.
4. Scroll to the red error.
5. Fix that file in VS Code.
6. Run:

```bash
git add .
git commit -m "Fix deployment"
git push
```

### If Supabase says permission denied
Make sure you ran `supabase/schema.sql` in SQL Editor.

### If Vercel says missing environment variable
Go to:

Project → Settings → Environment Variables

Add the missing key and redeploy.
