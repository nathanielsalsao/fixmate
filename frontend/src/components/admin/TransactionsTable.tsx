import { useState } from "react";
import { Search } from "lucide-react";
import type { Transaction } from "../../types/admin";

interface TransactionsTableProps {
  transactions: Transaction[];
}

const dateText = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const peso = (amount: number) =>
  `₱${Number(amount || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800 ring-amber-200",
    confirmed: "bg-blue-50 text-blue-800 ring-blue-200",
    in_progress: "bg-violet-50 text-violet-800 ring-violet-200",
    completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    cancelled: "bg-red-50 text-red-800 ring-red-200",
  };
  return classes[status] || "bg-stone-100 text-stone-700 ring-stone-200";
};

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = transactions.filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const searchable = [
      item.id,
      item.service_name,
      item.category,
      item.customer_name,
      item.customer_email,
      item.provider_name,
      item.address,
    ].join(" ").toLowerCase();

    return matchesStatus && (!query || searchable.includes(query));
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section id="all-transactions" className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="flex flex-col justify-between gap-4 border-b border-stone-200 p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h3 className="text-lg font-bold">All Transactions</h3>
          <p className="mt-1 text-sm text-stone-500">
            {filtered.length.toLocaleString()} matching booking records
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search service, customer..."
              className="w-full rounded-xl border border-stone-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Transaction / Service</th>
              <th className="px-5 py-4 font-semibold">Customer</th>
              <th className="px-5 py-4 font-semibold">Provider</th>
              <th className="px-5 py-4 font-semibold">Booking date</th>
              <th className="px-5 py-4 font-semibold">Price</th>
              <th className="px-5 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((item) => (
              <tr key={item.id} className="transition hover:bg-stone-50/80">
                <td className="px-5 py-4">
                  <p className="font-semibold text-stone-800">{item.service_name}</p>
                  <p className="mt-1 text-xs text-stone-400">{item.id}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium">{item.customer_name}</p>
                  <p className="mt-1 text-xs text-stone-500">{item.customer_email || "—"}</p>
                </td>
                <td className="px-5 py-4">{item.provider_name || "Unassigned"}</td>
                <td className="px-5 py-4">
                  <p>{dateText(item.booking_date)}</p>
                  <p className="mt-1 text-xs text-stone-400">Created {dateText(item.created_at)}</p>
                </td>
                <td className="px-5 py-4 font-semibold">{peso(item.base_price)}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusClass(item.status)}`}>
                    {item.status.replaceAll("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-stone-400">
                  No transactions match your search or selected status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col justify-between gap-3 border-t border-stone-200 px-5 py-4 text-sm sm:flex-row sm:items-center">
        <p className="text-stone-500">
          Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-lg border border-stone-200 px-3 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-2 text-stone-500">Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="rounded-lg border border-stone-200 px-3 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
