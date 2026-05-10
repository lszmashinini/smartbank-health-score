interface PillarCardProps {
  title: string;
  score: number;
  description: string;
}

export function PillarCard({ title, score, description }: PillarCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">{score}/100</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-900" style={{ width: `${score}%` }} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
