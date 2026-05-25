interface StatusDistributionProps {
  title: string;
  items: Array<{
    label: string;
    value: number;
  }>;
}

export function StatusDistribution({ title, items }: StatusDistributionProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>

      <div className="mt-5 space-y-4">
        {items.map((item) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;

          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-300">{item.label}</span>
                <span className="font-medium text-white">
                  {item.value} · {percentage}%
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-800">
                <div
                  className="h-2 rounded-full bg-cyan-400"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}

        {total === 0 ? (
          <p className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center text-sm text-slate-500">
            Sin datos disponibles.
          </p>
        ) : null}
      </div>
    </article>
  );
}
