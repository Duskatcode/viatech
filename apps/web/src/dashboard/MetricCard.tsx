import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>

        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
          <Icon size={24} />
        </div>
      </div>
    </article>
  );
}
