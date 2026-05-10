"use client";

import { useMemo, useState } from "react";
import { calculateHealthScore } from "@/lib/scoring";
import { sampleHealthScoreInput } from "@/lib/sampleData";
import type { HealthScoreResult } from "@/lib/types";
import { PillarCard } from "./PillarCard";
import { ScoreGauge } from "./ScoreGauge";
import { TransactionTable } from "./TransactionTable";

const pillarDescriptions = {
  incomeStability: "Checks salary consistency, frequency, volatility, and missed income patterns.",
  spendingDiscipline: "Compares essentials, non-essentials, subscriptions, lifestyle creep, and high-risk spend.",
  savingsStrength: "Measures savings rate, emergency fund coverage, retained balance, and saving behaviour.",
  debtCreditRisk: "Analyses debt-to-income, loan repayments, credit utilisation, payday loans, and missed repayments.",
  cashFlowResilience: "Looks at balance trend, low-balance days, overdraft risk, obligations, and income-delay survival."
};

export function Dashboard() {
  const localResult = useMemo(() => calculateHealthScore(sampleHealthScoreInput), []);
  const [result, setResult] = useState<HealthScoreResult>(localResult);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState("Local explainable model loaded.");

  async function runApiScore() {
    setLoading(true);
    setApiStatus("Calling /api/score...");

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sampleHealthScoreInput)
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = (await response.json()) as HealthScoreResult;
      setResult(data);
      setApiStatus("API scoring complete. The result is explainable and repeatable.");
    } catch (error) {
      setApiStatus(error instanceof Error ? error.message : "API scoring failed.");
    } finally {
      setLoading(false);
    }
  }

  const pillarEntries = [
    ["Income Stability", result.pillarScores.incomeStability, pillarDescriptions.incomeStability],
    ["Spending Discipline", result.pillarScores.spendingDiscipline, pillarDescriptions.spendingDiscipline],
    ["Savings Strength", result.pillarScores.savingsStrength, pillarDescriptions.savingsStrength],
    ["Debt & Credit Risk", result.pillarScores.debtCreditRisk, pillarDescriptions.debtCreditRisk],
    ["Cash-flow Resilience", result.pillarScores.cashFlowResilience, pillarDescriptions.cashFlowResilience]
  ] as const;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
              SmartBank Financial Health Score™
            </div>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Bank-grade financial wellness scoring that ordinary users can understand.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              The engine analyses income stability, spending discipline, savings strength, debt exposure and cash-flow resilience, then explains exactly why the score moved.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={runApiScore}
                disabled={loading}
                className="rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-bank transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Scoring..." : "Run API Score"}
              </button>
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600">
                {apiStatus}
              </div>
            </div>
          </div>
          <ScoreGauge score={result.healthScore} category={result.category} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Monthly income</p>
            <p className="mt-2 text-3xl font-black text-slate-950">R{result.metrics.monthlyIncome.toLocaleString("en-ZA")}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Savings rate</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{(result.metrics.savingsRate * 100).toFixed(1)}%</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Debt-to-income</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{(result.metrics.debtToIncomeRatio * 100).toFixed(1)}%</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Emergency fund</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{result.metrics.emergencyFundMonths} mo</p>
          </div>
        </div>

        <section className="mt-8 grid gap-5 lg:grid-cols-5">
          {pillarEntries.map(([title, score, description]) => (
            <PillarCard key={title} title={title} score={score} description={description} />
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Top risk factors</h2>
            <div className="mt-5 space-y-3">
              {result.topRiskFactors.map((risk) => (
                <div key={risk} className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-800">
                  {risk}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">Recommended actions</h2>
                <p className="text-sm text-slate-500">Projected improvement: +{result.projectedScoreImprovement} points</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {result.confidenceLevel} confidence
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {result.recommendedActions.map((action) => (
                <div key={action.action} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-bold text-slate-950">{action.action}</p>
                    <p className="text-sm font-black text-emerald-700">+{action.projectedScoreIncrease}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{action.reason}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Monthly impact: R{action.monthlyImpact.toLocaleString("en-ZA")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Why the score moved</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {result.explanation.map((line) => (
              <div key={line} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {line}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <TransactionTable transactions={sampleHealthScoreInput.transactions} />
        </section>
      </section>
    </main>
  );
}
