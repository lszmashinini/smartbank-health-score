# SmartBank Financial Health Score™

A production-ready MVP for SmartBanking Assistance Health Score.

## Summary

- Next.js 14 App Router + TypeScript + Tailwind dashboard.
- Explainable 0–100 financial health scoring engine.
- API endpoint: `POST /api/score`.
- Optional local Express backend: `npm run server`.
- Supabase schema and RLS policies included.
- Jest unit tests and Playwright browser flow included.

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

## Score categories

- 0–29 = Critical
- 30–49 = Weak
- 50–69 = Fair
- 70–84 = Good
- 85–100 = Excellent

## Formula

```text
Health Score =
  Income Stability x 20% +
  Spending Discipline x 20% +
  Savings Strength x 20% +
  Debt & Credit Risk x 20% +
  Cash-flow Resilience x 20%
```

## Project docs

- Product definition: `docs/product-definition.md`
- OpenAPI: `docs/openapi.yaml`
- Supabase SQL: `supabase/schema.sql`
- Deployment micro-steps: `README_DEPLOYMENT_MICRO_STEPS.md`

## Environment variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
PORT=4000
NODE_ENV=development
```

## Commands

```bash
npm run dev
npm run build
npm start
npm test
npx playwright install
npm run test:e2e
npm run server
```

## API example

```bash
curl -X POST http://localhost:3000/api/score \
  -H "Content-Type: application/json" \
  -d @sample-request.json
```

The sample data is in `src/lib/sampleData.ts`.
