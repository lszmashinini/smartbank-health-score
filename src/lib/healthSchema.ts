import { z } from "zod";

export const transactionSchema = z.object({
  id: z.string().min(1),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  description: z.string().min(1).max(180),
  merchant: z.string().min(1).max(120),
  amount: z.number().finite(),
  type: z.enum(["income", "expense", "transfer"]),
  category: z.enum([
    "salary",
    "rent",
    "groceries",
    "transport",
    "utilities",
    "insurance",
    "loan_repayment",
    "credit_card_payment",
    "payday_loan",
    "subscription",
    "gambling",
    "dining",
    "entertainment",
    "shopping",
    "savings_transfer",
    "medical",
    "education",
    "bank_fees",
    "other"
  ]),
  isRecurring: z.boolean().optional()
});

export const healthScoreInputSchema = z.object({
  userId: z.string().uuid().optional(),
  periodStart: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  periodEnd: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  currency: z.enum(["ZAR", "USD", "EUR", "GBP"]).default("ZAR"),
  openingBalance: z.number().finite().min(-1_000_000),
  closingBalance: z.number().finite().min(-1_000_000),
  currentBalance: z.number().finite().min(-1_000_000),
  emergencyFundBalance: z.number().finite().min(0),
  availableCreditLimit: z.number().finite().min(0),
  currentCreditUsed: z.number().finite().min(0),
  upcomingObligations: z.number().finite().min(0),
  transactions: z.array(transactionSchema).min(1, "At least one transaction is required")
});

export const scoreResponseSchema = z.object({
  healthScore: z.number().int().min(0).max(100),
  category: z.enum(["Critical", "Weak", "Fair", "Good", "Excellent"]),
  pillarScores: z.object({
    incomeStability: z.number().int().min(0).max(100),
    spendingDiscipline: z.number().int().min(0).max(100),
    savingsStrength: z.number().int().min(0).max(100),
    debtCreditRisk: z.number().int().min(0).max(100),
    cashFlowResilience: z.number().int().min(0).max(100)
  }),
  topRiskFactors: z.array(z.string()),
  recommendedActions: z.array(z.object({
    action: z.string(),
    reason: z.string(),
    monthlyImpact: z.number(),
    projectedScoreIncrease: z.number()
  })),
  projectedScoreImprovement: z.number(),
  confidenceLevel: z.enum(["Low", "Medium", "High"]),
  explanation: z.array(z.string()),
  metrics: z.object({
    monthlyIncome: z.number(),
    monthlyExpenses: z.number(),
    essentialSpend: z.number(),
    nonEssentialSpend: z.number(),
    savingsRate: z.number(),
    debtToIncomeRatio: z.number(),
    emergencyFundMonths: z.number(),
    subscriptionSpend: z.number(),
    gamblingSpend: z.number(),
    lowBalanceDays: z.number(),
    cashShortfallRiskDays: z.number().nullable()
  })
});

export type HealthScoreInputDto = z.infer<typeof healthScoreInputSchema>;
