import { calculateHealthScore } from "@/lib/scoring";
import { sampleHealthScoreInput } from "@/lib/sampleData";

function cloneSample() {
  return JSON.parse(JSON.stringify(sampleHealthScoreInput)) as typeof sampleHealthScoreInput;
}

describe("SmartBank Financial Health Score™", () => {
  it("returns a score, category, pillar scores and recommendations", () => {
    const result = calculateHealthScore(sampleHealthScoreInput);

    expect(result.healthScore).toBeGreaterThanOrEqual(0);
    expect(result.healthScore).toBeLessThanOrEqual(100);
    expect(result.category).toMatch(/Critical|Weak|Fair|Good|Excellent/);
    expect(result.pillarScores).toHaveProperty("incomeStability");
    expect(result.recommendedActions.length).toBeGreaterThan(0);
    expect(result.explanation.length).toBeGreaterThan(3);
  });

  it("penalizes gambling and high-risk spending", () => {
    const clean = cloneSample();
    clean.transactions = clean.transactions.filter((transaction) => transaction.category !== "gambling");

    const risky = cloneSample();
    risky.transactions.push({
      id: "tx-risk-extra",
      date: "2026-03-23",
      description: "Online betting extra spend",
      merchant: "Betting Merchant",
      amount: -3000,
      type: "expense",
      category: "gambling"
    });

    const cleanResult = calculateHealthScore(clean);
    const riskyResult = calculateHealthScore(risky);

    expect(riskyResult.pillarScores.spendingDiscipline).toBeLessThan(cleanResult.pillarScores.spendingDiscipline);
    expect(riskyResult.topRiskFactors).toContain("Gambling or high-risk spending detected");
  });

  it("improves savings strength when savings transfers increase", () => {
    const baseline = calculateHealthScore(sampleHealthScoreInput);
    const improved = cloneSample();
    improved.transactions.push({
      id: "tx-savings-extra",
      date: "2026-03-24",
      description: "Extra savings transfer",
      merchant: "SmartBank Savings Pocket",
      amount: -5000,
      type: "transfer",
      category: "savings_transfer"
    });
    improved.emergencyFundBalance += 5000;

    const improvedResult = calculateHealthScore(improved);
    expect(improvedResult.pillarScores.savingsStrength).toBeGreaterThan(baseline.pillarScores.savingsStrength);
  });
});
