# SmartBank Financial Health Score™ Product Definition

## 1. Product definition
SmartBank Financial Health Score™ is an explainable 0–100 financial wellness score for SmartBanking Assistance. It analyses banking transactions, income patterns, spending behaviour, savings behaviour, debt exposure and short-term cash-flow resilience.

The product is designed for ordinary users, banks, fintechs, employers, credit providers and financial wellness platforms that need a simple but credible view of affordability and financial health.

## 2. User journey
1. User connects or uploads banking transactions.
2. System categorises transactions into salary, rent, groceries, loans, subscriptions, gambling, savings and other categories.
3. User sees their score: Critical, Weak, Fair, Good or Excellent.
4. User sees pillar scores and exact reasons why the score moved.
5. User receives practical actions with monthly rand impact and estimated score improvement.
6. User can rescore monthly to track improvement.

## 3. Financial Health Score formula
Each pillar contributes 20%:

```text
Health Score =
  Income Stability x 0.20 +
  Spending Discipline x 0.20 +
  Savings Strength x 0.20 +
  Debt & Credit Risk x 0.20 +
  Cash-flow Resilience x 0.20
```

Categories:

- 0–29 = Critical
- 30–49 = Weak
- 50–69 = Fair
- 70–84 = Good
- 85–100 = Excellent

## 4. Example scoring calculation
Example pillar scores:

```json
{
  "incomeStability": 82,
  "spendingDiscipline": 55,
  "savingsStrength": 44,
  "debtCreditRisk": 61,
  "cashFlowResilience": 73
}
```

Calculation:

```text
(82 x 0.20) + (55 x 0.20) + (44 x 0.20) + (61 x 0.20) + (73 x 0.20) = 63
```

Category: Fair.

## 5. Database schema
See `supabase/schema.sql`.

## 6. API design
See `docs/openapi.yaml`. Main endpoint: `POST /api/score`.

## 7. AI recommendation logic
The MVP AI layer is explainable and rule-based:

- Rule-based financial insights: detects savings gaps, high debt ratios, low cash buffer and recurring subscriptions.
- Risk classification: maps healthScore to category and flags high-risk behaviours.
- Trend analysis: compares balance trend and income volatility.
- Anomaly detection: detects gambling, payday-loan usage, missed repayments and unusual debt increases.
- Recommendation engine: returns practical actions with projected score impact.
- Future ML: cash-flow stress prediction using labelled historical transaction windows.

## 8. Frontend dashboard layout
The dashboard contains:

- Hero section with score gauge.
- Monthly income, savings rate, debt-to-income and emergency fund summary cards.
- Five pillar score cards.
- Risk factors panel.
- Recommended actions panel.
- Explainability panel.
- Sample transaction table.

## 9. Backend TypeScript structure
Core scoring logic lives in `src/lib/scoring.ts` so it can be reused by:

- Next.js production API: `src/app/api/score/route.ts`
- Express API: `src/server/express.ts`
- Jest tests: `tests/scoring.test.ts`

## 10. Supabase tables and RLS policies
Tables:

- `profiles`
- `transactions`
- `health_score_runs`

RLS ensures users can only read and write their own transactions and score history.

## 11. Zod validation schemas
See `src/lib/healthSchema.ts`.

## 12. OpenAPI YAML
See `docs/openapi.yaml`.

## 13. Jest test cases
See `tests/scoring.test.ts`.

## 14. Playwright test flow
See `e2e/score.spec.ts`.

## 15. Risk, compliance and privacy considerations
- Do not store card PANs, CVVs or raw bank credentials.
- Use Supabase Auth and RLS for user-level isolation.
- Treat financial score as decision-support, not final credit approval.
- Add consent screens before bank-data ingestion.
- Keep explainability logs for auditability.
- Apply POPIA/GDPR style data minimisation.
- Use server-only service role keys; never expose them in frontend code.
- Add encryption, access logs and retention rules before enterprise banking deployment.

## 16. MVP roadmap
### Phase 1 — Current ZIP
- Explainable score engine.
- Dashboard.
- API endpoint.
- Supabase SQL and RLS.
- Tests and OpenAPI.

### Phase 2
- Supabase Auth UI.
- CSV bank-statement import.
- Transaction auto-categorisation review screen.
- Score history trend chart.

### Phase 3
- Bank integration via regulated open-banking provider.
- Cash-flow stress prediction.
- Budget coach and affordability simulator.
- Institution admin dashboard.

### Phase 4
- Enterprise audit logs.
- Model governance pack.
- Bias testing.
- White-label bank deployment.
