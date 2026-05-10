import type {
  ConfidenceLevel,
  HealthCategory,
  HealthScoreInput,
  HealthScoreResult,
  PillarScores,
  RecommendedAction,
  Transaction,
  TransactionCategory
} from "./types";

const ESSENTIAL_CATEGORIES = new Set<TransactionCategory>([
  "rent",
  "groceries",
  "transport",
  "utilities",
  "insurance",
  "loan_repayment",
  "credit_card_payment",
  "medical",
  "education",
  "bank_fees"
]);

const NON_ESSENTIAL_CATEGORIES = new Set<TransactionCategory>([
  "subscription",
  "gambling",
  "dining",
  "entertainment",
  "shopping"
]);

const PILLAR_WEIGHTS: Record<keyof PillarScores, number> = {
  incomeStability: 0.2,
  spendingDiscipline: 0.2,
  savingsStrength: 0.2,
  debtCreditRisk: 0.2,
  cashFlowResilience: 0.2
};

function clamp(value: number, min = 0, max = 100): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function round(value: number): number {
  return Math.round(clamp(value));
}

function absExpense(transaction: Transaction): number {
  return Math.abs(transaction.amount);
}

function monthKey(date: string): string {
  const parsed = new Date(date);
  return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}`;
}

function daysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const ms = Math.max(1, endDate.getTime() - startDate.getTime());
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

function periodMonths(input: HealthScoreInput): number {
  return Math.max(1, daysBetween(input.periodStart, input.periodEnd) / 30.4375);
}

function sumByCategory(transactions: Transaction[], category: TransactionCategory): number {
  return transactions
    .filter((transaction) => transaction.category === category)
    .reduce((total, transaction) => total + absExpense(transaction), 0);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length <= 1) return 0;
  const avg = average(values);
  const variance = values.reduce((total, value) => total + Math.pow(value - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function categoryFor(score: number): HealthCategory {
  if (score <= 29) return "Critical";
  if (score <= 49) return "Weak";
  if (score <= 69) return "Fair";
  if (score <= 84) return "Good";
  return "Excellent";
}

function confidenceFor(input: HealthScoreInput, monthlyIncome: number): ConfidenceLevel {
  const days = daysBetween(input.periodStart, input.periodEnd);
  if (input.transactions.length >= 30 && days >= 60 && monthlyIncome > 0) return "High";
  if (input.transactions.length >= 15 && days >= 30 && monthlyIncome > 0) return "Medium";
  return "Low";
}

function computeDailyBalances(input: HealthScoreInput): number[] {
  const start = new Date(input.periodStart);
  const end = new Date(input.periodEnd);
  const transactionsByDate = new Map<string, Transaction[]>();

  input.transactions.forEach((transaction) => {
    const key = transaction.date.slice(0, 10);
    const existing = transactionsByDate.get(key) ?? [];
    existing.push(transaction);
    transactionsByDate.set(key, existing);
  });

  const balances: number[] = [];
  let balance = input.openingBalance;
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const final = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

  while (cursor <= final) {
    const key = cursor.toISOString().slice(0, 10);
    const dayTransactions = transactionsByDate.get(key) ?? [];
    dayTransactions.forEach((transaction) => {
      balance += transaction.amount;
    });
    balances.push(balance);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return balances;
}

function scoreIncomeStability(input: HealthScoreInput, months: number): { score: number; explanation: string[] } {
  const salaryDeposits = input.transactions.filter(
    (transaction) => transaction.type === "income" && transaction.category === "salary" && transaction.amount > 0
  );
  const monthlyIncomeMap = new Map<string, number>();
  salaryDeposits.forEach((transaction) => {
    const key = monthKey(transaction.date);
    monthlyIncomeMap.set(key, (monthlyIncomeMap.get(key) ?? 0) + transaction.amount);
  });
  const incomeValues = Array.from(monthlyIncomeMap.values());
  const avgIncome = average(incomeValues);
  const incomeCoefficientOfVariation = avgIncome === 0 ? 1 : stdDev(incomeValues) / avgIncome;
  const monthsWithSalary = monthlyIncomeMap.size;
  const expectedMonths = Math.max(1, Math.round(months));
  const coverageRatio = clamp((monthsWithSalary / expectedMonths) * 100);
  const consistencyScore = clamp(100 - incomeCoefficientOfVariation * 180);
  const frequencyScore = clamp(coverageRatio);
  const missedIncomeMonths = Math.max(0, expectedMonths - monthsWithSalary);
  const missedIncomeScore = clamp(100 - missedIncomeMonths * 25);
  const salaryFrequencyScore = salaryDeposits.length >= expectedMonths ? 95 : clamp(salaryDeposits.length * 30);

  const score = round(
    consistencyScore * 0.35 +
      frequencyScore * 0.25 +
      missedIncomeScore * 0.2 +
      salaryFrequencyScore * 0.2
  );

  const explanation = [
    `Income stability is ${score}/100 because ${monthsWithSalary} salary month(s) were detected across the period.`,
    `Income volatility measured at ${(incomeCoefficientOfVariation * 100).toFixed(1)}%, which affects predictability.`
  ];

  return { score, explanation };
}

function scoreSpendingDiscipline(input: HealthScoreInput, monthlyIncome: number, months: number): { score: number; explanation: string[] } {
  const expenses = input.transactions.filter((transaction) => transaction.type === "expense");
  const totalExpenses = expenses.reduce((total, transaction) => total + absExpense(transaction), 0);
  const monthlyExpenses = totalExpenses / months;
  const nonEssentialSpend = expenses
    .filter((transaction) => NON_ESSENTIAL_CATEGORIES.has(transaction.category))
    .reduce((total, transaction) => total + absExpense(transaction), 0) / months;
  const subscriptionSpend = sumByCategory(expenses, "subscription") / months;
  const gamblingSpend = sumByCategory(expenses, "gambling") / months;

  const expenseRatio = monthlyIncome === 0 ? 1 : monthlyExpenses / monthlyIncome;
  const nonEssentialRatio = monthlyIncome === 0 ? 1 : nonEssentialSpend / monthlyIncome;
  const subscriptionRatio = monthlyIncome === 0 ? 1 : subscriptionSpend / monthlyIncome;
  const gamblingPenalty = gamblingSpend > 0 ? clamp((gamblingSpend / Math.max(monthlyIncome, 1)) * 350, 0, 35) : 0;

  const base = 100;
  const score = round(
    base -
      clamp((expenseRatio - 0.75) * 100, 0, 35) -
      clamp((nonEssentialRatio - 0.2) * 140, 0, 30) -
      clamp((subscriptionRatio - 0.03) * 180, 0, 15) -
      gamblingPenalty
  );

  const explanation = [
    `Spending discipline is ${score}/100 because monthly expenses are ${(expenseRatio * 100).toFixed(1)}% of income.`,
    `Non-essential spending is ${(nonEssentialRatio * 100).toFixed(1)}% of income and subscriptions total about R${subscriptionSpend.toFixed(0)}/month.`
  ];

  return { score, explanation };
}

function scoreSavingsStrength(input: HealthScoreInput, monthlyIncome: number, essentialSpend: number, months: number): { score: number; explanation: string[] } {
  const savingsTransfers = input.transactions
    .filter((transaction) => transaction.category === "savings_transfer")
    .reduce((total, transaction) => total + absExpense(transaction), 0) / months;
  const savingsRate = monthlyIncome === 0 ? 0 : savingsTransfers / monthlyIncome;
  const emergencyFundMonths = essentialSpend === 0 ? 0 : input.emergencyFundBalance / essentialSpend;
  const retainedBalance = Math.max(0, input.closingBalance - input.openingBalance);
  const retainedBalanceScore = monthlyIncome === 0 ? 0 : clamp((retainedBalance / monthlyIncome) * 100);
  const savingsRateScore = clamp((savingsRate / 0.2) * 100);
  const emergencyFundScore = clamp((emergencyFundMonths / 3) * 100);
  const goalBehaviorScore = savingsTransfers > 0 ? 85 : 20;

  const score = round(
    savingsRateScore * 0.4 + emergencyFundScore * 0.35 + retainedBalanceScore * 0.15 + goalBehaviorScore * 0.1
  );

  const explanation = [
    `Savings strength is ${score}/100 with a savings rate of ${(savingsRate * 100).toFixed(1)}%.`,
    `Emergency fund coverage is ${emergencyFundMonths.toFixed(1)} month(s); a safer target is 3 months or more.`
  ];

  return { score, explanation };
}

function scoreDebtCreditRisk(input: HealthScoreInput, monthlyIncome: number, months: number): { score: number; explanation: string[] } {
  const monthlyLoanRepayments = input.transactions
    .filter((transaction) => ["loan_repayment", "credit_card_payment", "payday_loan"].includes(transaction.category))
    .reduce((total, transaction) => total + absExpense(transaction), 0) / months;
  const paydayLoanSpend = sumByCategory(input.transactions, "payday_loan") / months;
  const missedRepayments = input.transactions.filter((transaction) =>
    /missed|failed|reversal|arrears|late/i.test(transaction.description)
  ).length;
  const debtToIncomeRatio = monthlyIncome === 0 ? 1 : monthlyLoanRepayments / monthlyIncome;
  const creditUtilization = input.availableCreditLimit === 0 ? 0 : input.currentCreditUsed / input.availableCreditLimit;

  const dtiScore = clamp(100 - clamp((debtToIncomeRatio - 0.25) * 160, 0, 60));
  const utilizationScore = clamp(100 - clamp((creditUtilization - 0.3) * 140, 0, 50));
  const paydayLoanScore = paydayLoanSpend > 0 ? 35 : 100;
  const repaymentHistoryScore = clamp(100 - missedRepayments * 25);
  const score = round(dtiScore * 0.4 + utilizationScore * 0.25 + paydayLoanScore * 0.2 + repaymentHistoryScore * 0.15);

  const explanation = [
    `Debt & credit risk is ${score}/100 because debt repayments are ${(debtToIncomeRatio * 100).toFixed(1)}% of income.`,
    `Credit utilization is ${(creditUtilization * 100).toFixed(1)}%; safer usage is usually below 30%.`
  ];

  return { score, explanation };
}

function scoreCashFlowResilience(input: HealthScoreInput, monthlyIncome: number, months: number): { score: number; explanation: string[]; lowBalanceDays: number; cashShortfallRiskDays: number | null } {
  const balances = computeDailyBalances(input);
  const lowBalanceThreshold = Math.max(500, monthlyIncome * 0.08);
  const lowBalanceDays = balances.filter((balance) => balance < lowBalanceThreshold).length;
  const overdraftDays = balances.filter((balance) => balance < 0).length;
  const balanceTrendRatio = input.openingBalance === 0 ? 0 : (input.closingBalance - input.openingBalance) / Math.abs(input.openingBalance);
  const trendScore = clamp(60 + balanceTrendRatio * 120);
  const lowBalanceScore = clamp(100 - (lowBalanceDays / Math.max(1, balances.length)) * 120);
  const overdraftScore = clamp(100 - overdraftDays * 15);
  const monthlyObligationPressure = monthlyIncome === 0 ? 1 : input.upcomingObligations / monthlyIncome;
  const obligationScore = clamp(100 - monthlyObligationPressure * 75);

  const monthlyExpenses = input.transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + absExpense(transaction), 0) / months;
  const averageDailySpend = monthlyExpenses / 30.4375;
  const survivableDays = averageDailySpend === 0 ? 90 : Math.floor(input.currentBalance / averageDailySpend);
  const cashShortfallRiskDays = survivableDays < 14 ? Math.max(0, survivableDays) : null;
  const survivalScore = clamp((survivableDays / 30) * 100);

  const score = round(trendScore * 0.25 + lowBalanceScore * 0.25 + overdraftScore * 0.2 + obligationScore * 0.15 + survivalScore * 0.15);

  const explanation = [
    `Cash-flow resilience is ${score}/100 with ${lowBalanceDays} low-balance day(s) in the period.`,
    cashShortfallRiskDays === null
      ? "Current balance appears able to cover near-term normal spending."
      : `You are at risk of cash pressure in about ${cashShortfallRiskDays} day(s) if spending continues unchanged.`
  ];

  return { score, explanation, lowBalanceDays, cashShortfallRiskDays };
}

function buildRiskFactors(params: {
  monthlyIncome: number;
  nonEssentialSpend: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
  gamblingSpend: number;
  subscriptionSpend: number;
  lowBalanceDays: number;
}): string[] {
  const risks: string[] = [];
  if (params.savingsRate < 0.1) risks.push("Savings rate below recommended level");
  if (params.nonEssentialSpend / Math.max(params.monthlyIncome, 1) > 0.25) risks.push("High non-essential spending");
  if (params.debtToIncomeRatio > 0.35) risks.push("Loan repayments above safe affordability range");
  if (params.emergencyFundMonths < 1) risks.push("Emergency fund below one month of essential expenses");
  if (params.gamblingSpend > 0) risks.push("Gambling or high-risk spending detected");
  if (params.subscriptionSpend / Math.max(params.monthlyIncome, 1) > 0.04) risks.push("Recurring subscriptions are consuming cash flow");
  if (params.lowBalanceDays >= 5) risks.push("Frequent low-balance days create cash-shortfall risk");
  return risks.slice(0, 5);
}

function buildRecommendedActions(params: {
  monthlyIncome: number;
  subscriptionSpend: number;
  gamblingSpend: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
  cashShortfallRiskDays: number | null;
}): RecommendedAction[] {
  const actions: RecommendedAction[] = [];

  if (params.subscriptionSpend >= 100) {
    actions.push({
      action: "Reduce subscriptions",
      reason: `Unused or duplicated subscriptions cost about R${params.subscriptionSpend.toFixed(0)}/month.`,
      monthlyImpact: Math.round(params.subscriptionSpend),
      projectedScoreIncrease: 4
    });
  }

  if (params.savingsRate < 0.1 && params.monthlyIncome > 0) {
    const targetSavings = params.monthlyIncome * 0.1;
    actions.push({
      action: "Increase savings transfer to 10% of income",
      reason: `Your current savings rate is ${(params.savingsRate * 100).toFixed(1)}%.`,
      monthlyImpact: Math.round(targetSavings),
      projectedScoreIncrease: 8
    });
  }

  if (params.emergencyFundMonths < 3) {
    actions.push({
      action: "Build a 3-month emergency fund",
      reason: `Your emergency fund covers only ${params.emergencyFundMonths.toFixed(1)} month(s).`,
      monthlyImpact: Math.round(Math.max(500, params.monthlyIncome * 0.05)),
      projectedScoreIncrease: 6
    });
  }

  if (params.debtToIncomeRatio > 0.35) {
    actions.push({
      action: "Restructure high monthly debt repayments",
      reason: `Debt repayments are ${(params.debtToIncomeRatio * 100).toFixed(1)}% of income.`,
      monthlyImpact: Math.round(params.monthlyIncome * (params.debtToIncomeRatio - 0.3)),
      projectedScoreIncrease: 7
    });
  }

  if (params.gamblingSpend > 0) {
    actions.push({
      action: "Block gambling/high-risk merchants",
      reason: `High-risk gambling spend of about R${params.gamblingSpend.toFixed(0)}/month was detected.`,
      monthlyImpact: Math.round(params.gamblingSpend),
      projectedScoreIncrease: 5
    });
  }

  if (params.cashShortfallRiskDays !== null) {
    actions.push({
      action: "Create a 14-day cash buffer before discretionary spending",
      reason: `You are at risk of a cash shortfall in about ${params.cashShortfallRiskDays} day(s).`,
      monthlyImpact: Math.round(Math.max(750, params.monthlyIncome * 0.05)),
      projectedScoreIncrease: 6
    });
  }

  return actions.sort((a, b) => b.projectedScoreIncrease - a.projectedScoreIncrease).slice(0, 5);
}

export function calculateHealthScore(input: HealthScoreInput): HealthScoreResult {
  const months = periodMonths(input);
  const expenses = input.transactions.filter((transaction) => transaction.type === "expense");
  const monthlyIncome = input.transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Math.max(0, transaction.amount), 0) / months;
  const monthlyExpenses = expenses.reduce((total, transaction) => total + absExpense(transaction), 0) / months;
  const essentialSpend = expenses
    .filter((transaction) => ESSENTIAL_CATEGORIES.has(transaction.category))
    .reduce((total, transaction) => total + absExpense(transaction), 0) / months;
  const nonEssentialSpend = expenses
    .filter((transaction) => NON_ESSENTIAL_CATEGORIES.has(transaction.category))
    .reduce((total, transaction) => total + absExpense(transaction), 0) / months;
  const subscriptionSpend = sumByCategory(expenses, "subscription") / months;
  const gamblingSpend = sumByCategory(expenses, "gambling") / months;
  const savingsTransfers = sumByCategory(input.transactions, "savings_transfer") / months;
  const monthlyDebtRepayments = expenses
    .filter((transaction) => ["loan_repayment", "credit_card_payment", "payday_loan"].includes(transaction.category))
    .reduce((total, transaction) => total + absExpense(transaction), 0) / months;

  const savingsRate = monthlyIncome === 0 ? 0 : savingsTransfers / monthlyIncome;
  const debtToIncomeRatio = monthlyIncome === 0 ? 1 : monthlyDebtRepayments / monthlyIncome;
  const emergencyFundMonths = essentialSpend === 0 ? 0 : input.emergencyFundBalance / essentialSpend;

  const income = scoreIncomeStability(input, months);
  const spending = scoreSpendingDiscipline(input, monthlyIncome, months);
  const savings = scoreSavingsStrength(input, monthlyIncome, essentialSpend, months);
  const debt = scoreDebtCreditRisk(input, monthlyIncome, months);
  const cashFlow = scoreCashFlowResilience(input, monthlyIncome, months);

  const pillarScores: PillarScores = {
    incomeStability: income.score,
    spendingDiscipline: spending.score,
    savingsStrength: savings.score,
    debtCreditRisk: debt.score,
    cashFlowResilience: cashFlow.score
  };

  const healthScore = round(
    pillarScores.incomeStability * PILLAR_WEIGHTS.incomeStability +
      pillarScores.spendingDiscipline * PILLAR_WEIGHTS.spendingDiscipline +
      pillarScores.savingsStrength * PILLAR_WEIGHTS.savingsStrength +
      pillarScores.debtCreditRisk * PILLAR_WEIGHTS.debtCreditRisk +
      pillarScores.cashFlowResilience * PILLAR_WEIGHTS.cashFlowResilience
  );

  const topRiskFactors = buildRiskFactors({
    monthlyIncome,
    nonEssentialSpend,
    savingsRate,
    debtToIncomeRatio,
    emergencyFundMonths,
    gamblingSpend,
    subscriptionSpend,
    lowBalanceDays: cashFlow.lowBalanceDays
  });

  const recommendedActions = buildRecommendedActions({
    monthlyIncome,
    subscriptionSpend,
    gamblingSpend,
    savingsRate,
    debtToIncomeRatio,
    emergencyFundMonths,
    cashShortfallRiskDays: cashFlow.cashShortfallRiskDays
  });

  return {
    healthScore,
    category: categoryFor(healthScore),
    pillarScores,
    topRiskFactors,
    recommendedActions,
    projectedScoreImprovement: recommendedActions.reduce((total, action) => total + action.projectedScoreIncrease, 0),
    confidenceLevel: confidenceFor(input, monthlyIncome),
    explanation: [
      ...income.explanation,
      ...spending.explanation,
      ...savings.explanation,
      ...debt.explanation,
      ...cashFlow.explanation
    ],
    metrics: {
      monthlyIncome: Math.round(monthlyIncome),
      monthlyExpenses: Math.round(monthlyExpenses),
      essentialSpend: Math.round(essentialSpend),
      nonEssentialSpend: Math.round(nonEssentialSpend),
      savingsRate: Number(savingsRate.toFixed(3)),
      debtToIncomeRatio: Number(debtToIncomeRatio.toFixed(3)),
      emergencyFundMonths: Number(emergencyFundMonths.toFixed(2)),
      subscriptionSpend: Math.round(subscriptionSpend),
      gamblingSpend: Math.round(gamblingSpend),
      lowBalanceDays: cashFlow.lowBalanceDays,
      cashShortfallRiskDays: cashFlow.cashShortfallRiskDays
    }
  };
}
