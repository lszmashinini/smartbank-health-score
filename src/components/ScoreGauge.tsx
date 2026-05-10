import type { HealthCategory } from "@/lib/types";

interface ScoreGaugeProps {
  score: number;
  category: HealthCategory;
}

function categoryStyle(category: HealthCategory): string {
  switch (category) {
    case "Critical":
      return "bg-red-100 text-red-700 border-red-200";
    case "Weak":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Fair":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Good":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Excellent":
      return "bg-sky-100 text-sky-700 border-sky-200";
  }
}

export function ScoreGauge({ score, category }: ScoreGaugeProps) {
  const circumference = 2 * Math.PI * 88;
  const progress = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-bank">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-60 w-60">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 220 220" aria-label={`Score ${score}`}>
            <circle cx="110" cy="110" r="88" stroke="rgba(255,255,255,0.12)" strokeWidth="18" fill="none" />
            <circle
              cx="110"
              cy="110"
              r="88"
              stroke="currentColor"
              strokeWidth="18"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              className="text-emerald-400 transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm uppercase tracking-[0.28em] text-slate-400">Health Score</span>
            <span className="text-6xl font-black tracking-tight">{score}</span>
            <span className="text-sm text-slate-400">out of 100</span>
          </div>
        </div>
        <div className={`rounded-full border px-4 py-2 text-sm font-bold ${categoryStyle(category)}`}>
          {category}
        </div>
      </div>
    </div>
  );
}
