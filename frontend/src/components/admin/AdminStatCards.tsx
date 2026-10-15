import type { ComponentType } from "react";

interface AdminStat {
  label: string;
  value: number;
  detail: string;
  icon: ComponentType<{ size?: number }>;
}

interface AdminStatCardsProps {
  stats: AdminStat[];
}

export default function AdminStatCards({ stats }: AdminStatCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article key={stat.label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-stone-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800">
                <Icon size={21} />
              </div>
            </div>
            <p className="mt-4 border-t border-stone-100 pt-3 text-xs text-stone-500">{stat.detail}</p>
          </article>
        );
      })}
    </section>
  );
}
