import { NextResponse } from "next/server";
import { calculateHealthScore } from "@/lib/scoring";
import { healthScoreInputSchema } from "@/lib/healthSchema";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET() {
  return NextResponse.json({
    service: "SmartBank Financial Health Score™ API",
    status: "ok",
    endpoints: ["POST /api/score"]
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = healthScoreInputSchema.parse(body);
    const result = calculateHealthScore(input);

    const supabase = getSupabaseAdminClient();
    if (supabase && input.userId) {
      const { error } = await supabase.from("health_score_runs").insert({
        user_id: input.userId,
        period_start: input.periodStart.slice(0, 10),
        period_end: input.periodEnd.slice(0, 10),
        health_score: result.healthScore,
        category: result.category,
        pillar_scores: result.pillarScores,
        top_risk_factors: result.topRiskFactors,
        recommended_actions: result.recommendedActions,
        projected_score_improvement: result.projectedScoreImprovement,
        confidence_level: result.confidenceLevel
      });

      if (error) {
        console.error("Supabase persistence failed", error.message);
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Invalid health-score request", details: message },
      { status: 400 }
    );
  }
}
