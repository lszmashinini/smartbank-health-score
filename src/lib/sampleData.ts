import type { HealthScoreInput } from "./types";

export const sampleHealthScoreInput: HealthScoreInput = {
  periodStart: "2026-01-01",
  periodEnd: "2026-03-31",
  currency: "ZAR",
  openingBalance: 5200,
  closingBalance: 4100,
  currentBalance: 2900,
  emergencyFundBalance: 8500,
  availableCreditLimit: 25000,
  currentCreditUsed: 11750,
  upcomingObligations: 8400,
  transactions: [
    { id: "tx-001", date: "2026-01-25", description: "Salary deposit", merchant: "Employer Payroll", amount: 24000, type: "income", category: "salary", isRecurring: true },
    { id: "tx-002", date: "2026-02-25", description: "Salary deposit", merchant: "Employer Payroll", amount: 24000, type: "income", category: "salary", isRecurring: true },
    { id: "tx-003", date: "2026-03-26", description: "Salary deposit", merchant: "Employer Payroll", amount: 23200, type: "income", category: "salary", isRecurring: true },

    { id: "tx-004", date: "2026-01-01", description: "Rent debit order", merchant: "Landlord", amount: -7400, type: "expense", category: "rent", isRecurring: true },
    { id: "tx-005", date: "2026-02-01", description: "Rent debit order", merchant: "Landlord", amount: -7400, type: "expense", category: "rent", isRecurring: true },
    { id: "tx-006", date: "2026-03-01", description: "Rent debit order", merchant: "Landlord", amount: -7400, type: "expense", category: "rent", isRecurring: true },

    { id: "tx-007", date: "2026-01-03", description: "Groceries", merchant: "Checkers", amount: -1850, type: "expense", category: "groceries" },
    { id: "tx-008", date: "2026-02-04", description: "Groceries", merchant: "Pick n Pay", amount: -2100, type: "expense", category: "groceries" },
    { id: "tx-009", date: "2026-03-04", description: "Groceries", merchant: "Shoprite", amount: -2200, type: "expense", category: "groceries" },

    { id: "tx-010", date: "2026-01-05", description: "Vehicle finance repayment", merchant: "Bank Auto Finance", amount: -3900, type: "expense", category: "loan_repayment", isRecurring: true },
    { id: "tx-011", date: "2026-02-05", description: "Vehicle finance repayment", merchant: "Bank Auto Finance", amount: -3900, type: "expense", category: "loan_repayment", isRecurring: true },
    { id: "tx-012", date: "2026-03-05", description: "Vehicle finance repayment", merchant: "Bank Auto Finance", amount: -4600, type: "expense", category: "loan_repayment", isRecurring: true },

    { id: "tx-013", date: "2026-01-07", description: "Netflix subscription", merchant: "Netflix", amount: -199, type: "expense", category: "subscription", isRecurring: true },
    { id: "tx-014", date: "2026-01-08", description: "Spotify subscription", merchant: "Spotify", amount: -65, type: "expense", category: "subscription", isRecurring: true },
    { id: "tx-015", date: "2026-02-07", description: "Netflix subscription", merchant: "Netflix", amount: -199, type: "expense", category: "subscription", isRecurring: true },
    { id: "tx-016", date: "2026-02-08", description: "Spotify subscription", merchant: "Spotify", amount: -65, type: "expense", category: "subscription", isRecurring: true },
    { id: "tx-017", date: "2026-03-07", description: "Netflix subscription", merchant: "Netflix", amount: -199, type: "expense", category: "subscription", isRecurring: true },
    { id: "tx-018", date: "2026-03-08", description: "Spotify subscription", merchant: "Spotify", amount: -65, type: "expense", category: "subscription", isRecurring: true },
    { id: "tx-019", date: "2026-03-09", description: "Unused gym subscription", merchant: "Gym Club", amount: -450, type: "expense", category: "subscription", isRecurring: true },

    { id: "tx-020", date: "2026-01-10", description: "Transport fuel", merchant: "Engen", amount: -1100, type: "expense", category: "transport" },
    { id: "tx-021", date: "2026-02-10", description: "Transport fuel", merchant: "Shell", amount: -1220, type: "expense", category: "transport" },
    { id: "tx-022", date: "2026-03-10", description: "Transport fuel", merchant: "BP", amount: -1250, type: "expense", category: "transport" },

    { id: "tx-023", date: "2026-01-12", description: "Eating out", merchant: "Restaurant", amount: -840, type: "expense", category: "dining" },
    { id: "tx-024", date: "2026-02-14", description: "Clothing purchase", merchant: "Fashion Store", amount: -1650, type: "expense", category: "shopping" },
    { id: "tx-025", date: "2026-03-14", description: "Entertainment", merchant: "Cinema", amount: -620, type: "expense", category: "entertainment" },

    { id: "tx-026", date: "2026-01-15", description: "Savings transfer", merchant: "SmartBank Savings Pocket", amount: -1100, type: "transfer", category: "savings_transfer", isRecurring: true },
    { id: "tx-027", date: "2026-02-15", description: "Savings transfer", merchant: "SmartBank Savings Pocket", amount: -1000, type: "transfer", category: "savings_transfer", isRecurring: true },
    { id: "tx-028", date: "2026-03-15", description: "Savings transfer", merchant: "SmartBank Savings Pocket", amount: -800, type: "transfer", category: "savings_transfer", isRecurring: true },

    { id: "tx-029", date: "2026-03-17", description: "Online betting", merchant: "Betting Merchant", amount: -950, type: "expense", category: "gambling" },
    { id: "tx-030", date: "2026-03-21", description: "Utilities debit order", merchant: "Municipality", amount: -1450, type: "expense", category: "utilities", isRecurring: true },
    { id: "tx-031", date: "2026-02-21", description: "Utilities debit order", merchant: "Municipality", amount: -1320, type: "expense", category: "utilities", isRecurring: true },
    { id: "tx-032", date: "2026-01-21", description: "Utilities debit order", merchant: "Municipality", amount: -1260, type: "expense", category: "utilities", isRecurring: true },
    { id: "tx-033", date: "2026-03-22", description: "Bank fees", merchant: "SmartBank", amount: -95, type: "expense", category: "bank_fees", isRecurring: true }
  ]
};
