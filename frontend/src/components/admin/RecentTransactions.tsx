import type { Transaction } from "../../types/admin";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const peso = (amount: number) =>
  `₱${Number(amount || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const dateText = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-PH");
};

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800",
    confirmed: "bg-blue-50 text-blue-800",
    in_progress: "bg-violet-50 text-violet-800",
    completed: "bg-emerald-100 text-emerald-900",
    cancelled: "bg-red-50 text-red-800",
  };
  return classes[status] || "bg-stone-100 text-stone-700";
};

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <article className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">Recent Transactions</h3>
          <p className="mt-1 text-sm text-stone-500">Latest booking records</p>
        </div>
        <button
          onClick={() => document.getElementById("all-transactions")?.scrollIntoView({ behavior: "smooth" })}
          className="shrink-0 text-sm font-semibold text-emerald-800 hover:underline"
        >
          View all
        </button>
      </div>

      <div className="mt-4 divide-y divide-stone-100">
        {transactions.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{item.service_name}</p>
              <p className="mt-1 truncate text-xs text-stone-500">
                {item.customer_name} · {dateText(item.created_at)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold">{peso(item.base_price)}</p>
              <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusClass(item.status)}`}>
                {item.status.replaceAll("_", " ")}
              </span>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="py-8 text-center text-sm text-stone-400">No transactions recorded yet.</p>
        )}
      </div>
    </article>
  );
}
