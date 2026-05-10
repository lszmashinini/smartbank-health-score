export type TransactionType = "income" | "expense" | "transfer";

export type TransactionCategory =
  | "salary"
  | "rent"
  | "groceries"
  | "transport"
  | "utilities"
  | "insurance"
  | "loan_repayment"
  | "credit_card_payment"
  | "payday_loan"
  | "subscription"
  | "gambling"
  | "dining"
  | "entertainment"
  | "shopping"
  | "savings_transfer"
  | "medical"
  | "education"
  | "bank_fees"
  | "other";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  merchant: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  isRecurring?: boolean;
}

export interface HealthScoreInput {
  userId?: string;
  periodStart: string;
  periodEnd: string;
  currency: "ZAR" | "USD" | "EUR" | "GBP";
  openingBalance: number;
  closingBalance: number;
  currentBalance: number;
  emergencyFundBalance: number;
  availableCreditLimit: number;
  currentCreditUsed: number;
  upcomingObligations: number;
  transactions: Transaction[];
}

export type HealthCategory = "Critical" | "Weak" | "Fair" | "Good" | "Excellent";
export type ConfidenceLevel = "Low" | "Medium" | "High";

export interface PillarScores {
  incomeStability: number;
  spendingDiscipline: number;
  savingsStrength: number;
  debtCreditRisk: number;
  cashFlowResilience: number;
}

export interface RecommendedAction {
  action: string;
  reason: string;
  monthlyImpact: number;
  projectedScoreIncrease: number;
}

export interface HealthScoreResult {
  healthScore: number;
  category: HealthCategory;
  pillarScores: PillarScores;
  topRiskFactors: string[];
  recommendedActions: RecommendedAction[];
  projectedScoreImprovement: number;
  confidenceLevel: ConfidenceLevel;
  explanation: string[];
  metrics: {
    monthlyIncome: number;
    monthlyExpenses: number;
    essentialSpend: number;
    nonEssentialSpend: number;
    savingsRate: number;
    debtToIncomeRatio: number;
    emergencyFundMonths: number;
    subscriptionSpend: number;
    gamblingSpend: number;
    lowBalanceDays: number;
    cashShortfallRiskDays: number | null;
  };
}
