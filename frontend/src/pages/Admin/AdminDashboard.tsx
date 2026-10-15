import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminStatCards from "../../components/admin/AdminStatCards";
import {
  CalendarCheck, CheckCircle2, Users,
  Wrench, Search, TrendingUp, PhilippinePeso, BriefcaseBusiness,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

import type { AdminDashboardProps } from "../../types/admin";
import {
  peso,
  dateText,
  statusLabel,
  statusClass,
} from "../../utils/adminFormatters";


const GREEN = "#176b45";
const PIE_COLORS = ["#eab308", "#3b82f6", "#8b5cf6", "#16a34a", "#ef4444"];

export default function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    dashboard,
    loading,
    refreshing,
    error,
    loadDashboard,
  } = useAdminDashboard(token);
  function handleLogout() {
    onLogout();
    navigate("/login", { replace: true });
  }

  const transactions = dashboard?.transactions ?? dashboard?.recent_bookings.map((b) => ({
    ...b,
    category: "Other",
    booking_date: null,
    updated_at: null,
    customer_id: null,
    customer_name: "—",
    customer_email: "",
    provider_id: null,
    provider_name: "—",
    address: "",
    notes: "",
  })) ?? [];

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return transactions.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const searchable = [
        item.id, item.service_name, item.category, item.customer_name,
        item.customer_email, item.provider_name, item.address,
      ].join(" ").toLowerCase();
      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [transactions, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageTransactions = filteredTransactions.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const statusData = dashboard ? [
    { name: "Pending", value: dashboard.bookings.pending },
    { name: "Confirmed", value: dashboard.bookings.confirmed },
    { name: "In Progress", value: dashboard.bookings.in_progress },
    { name: "Completed", value: dashboard.bookings.completed },
    { name: "Cancelled", value: dashboard.bookings.cancelled },
  ].filter((item) => item.value > 0) : [];

  const stats = dashboard ? [
    {
      label: "Total Users",
      value: dashboard.users.customers + dashboard.users.providers + dashboard.users.admins,
      detail: `${dashboard.users.customers} customers · ${dashboard.users.providers} providers`,
      icon: Users,
    },
    {
      label: "Active Services",
      value: dashboard.services.active,
      detail: `${dashboard.services.total} services in catalog`,
      icon: Wrench,
    },
    {
      label: "Total Bookings",
      value: dashboard.bookings.total,
      detail: `${dashboard.bookings.pending} awaiting action`,
      icon: CalendarCheck,
    },
    {
      label: "Completed Jobs",
      value: dashboard.bookings.completed,
      detail: `${dashboard.bookings.in_progress} currently in progress`,
      icon: CheckCircle2,
    },
  ] : [];

  return (
    <main className="min-h-screen bg-[#f5f7f3] text-stone-900">
      <AdminHeader
        refreshing={refreshing}
        loading={loading}
        onRefresh={() => void loadDashboard(true)}
        onLogout={handleLogout}
      />

      <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 sm:py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-emerald-800">OVERVIEW / ANALYTICS</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Admin Dashboard</h2>
            <p className="mt-2 text-sm text-stone-500">
              Monitor service booking trends, and customer transactions.
            </p>
          </div>
          <div className="text-sm text-stone-500">
            <span className="font-semibold text-stone-700">Report date:</span>{" "}
            {new Date().toLocaleDateString("en-PH", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-stone-500">
            Loading analytics from FixMate...
          </div>
        )}

        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            <p className="font-bold">Could not load dashboard data</p>
            <p className="mt-1">{error}</p>
            <button onClick={() => void loadDashboard()} className="mt-3 font-semibold underline">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && dashboard && (
          <>
            <AdminStatCards stats={stats} />

            <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <article className="rounded-2xl border border-stone-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-800"><PhilippinePeso size={20} /></div>
                  <div>
                    <p className="text-sm text-stone-500">Total Booking Value</p>
                    <p className="mt-1 text-2xl font-bold">{peso(dashboard.total_booking_value ?? transactions.reduce((sum, t) => sum + Number(t.base_price || 0), 0))}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-stone-500">Listed booking prices, not verified payments.</p>
              </article>
              <article className="rounded-2xl border border-stone-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-800"><BriefcaseBusiness size={20} /></div>
                  <div>
                    <p className="text-sm text-stone-500">Service Providers</p>
                    <p className="mt-1 text-2xl font-bold">{dashboard.users.providers.toLocaleString()}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-stone-500">{dashboard.services.inactive} inactive services in the catalog.</p>
              </article>
              <article className="rounded-2xl border border-stone-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-50 p-2.5 text-violet-800"><TrendingUp size={20} /></div>
                  <div>
                    <p className="text-sm text-stone-500">Completion Rate</p>
                    <p className="mt-1 text-2xl font-bold">
                      {dashboard.bookings.total
                        ? `${Math.round((dashboard.bookings.completed / dashboard.bookings.total) * 100)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-stone-500">Completed bookings divided by all bookings.</p>
              </article>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-2">
              <article className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">Booking Status Distribution</h3>
                    <p className="mt-1 text-sm text-stone-500">Breakdown of all booking records</p>
                  </div>
                  <span className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-semibold">{dashboard.bookings.total} total</span>
                </div>
                <div className="mt-4 h-[290px]">
                  {statusData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="47%" innerRadius={65} outerRadius={100} paddingAngle={3}>
                          {statusData.map((entry) => (
                            <Cell key={entry.name} fill={PIE_COLORS[["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"].indexOf(entry.name)] || GREEN} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [Number(value), "Bookings"]} />
                        <Legend verticalAlign="bottom" height={35} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-stone-400">No bookings to chart yet.</div>
                  )}
                </div>
              </article>

              <article className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
                <h3 className="font-bold">Monthly Booking Trend</h3>
                <p className="mt-1 text-sm text-stone-500">Bookings created over the last six months</p>
                <div className="mt-4 h-[290px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboard.monthly_bookings ?? []} margin={{ top: 10, right: 8, left: -18, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="bookings" name="Bookings" fill={GREEN} radius={[6, 6, 0, 0]} maxBarSize={46} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <article className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
                <h3 className="font-bold">Popular Services</h3>
                <p className="mt-1 text-sm text-stone-500">Most-booked services across all records</p>
                <div className="mt-5 h-[270px]">
                  {(dashboard.popular_services ?? []).length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboard.popular_services ?? []} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e7e5e4" />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" width={105} tick={{ fontSize: 11, fill: "#57534e" }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="bookings" name="Bookings" fill="#65a30d" radius={[0, 5, 5, 0]} maxBarSize={26} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-stone-400">No service activity yet.</div>
                  )}
                </div>
              </article>

              <article className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold">Recent Transactions</h3>
                    <p className="mt-1 text-sm text-stone-500">Latest booking records</p>
                  </div>
                  <button
                    onClick={() => {
                      document.getElementById("all-transactions")?.scrollIntoView({ behavior: "smooth" });
                    }}
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
                        <p className="mt-1 truncate text-xs text-stone-500">{item.customer_name} · {dateText(item.created_at)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold">{peso(item.base_price)}</p>
                        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ${statusClass(item.status)}`}>
                          {statusLabel(item.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && <p className="py-8 text-center text-sm text-stone-400">No transactions recorded yet.</p>}
                </div>
              </article>
            </section>

            <section id="all-transactions" className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <div className="flex flex-col justify-between gap-4 border-b border-stone-200 p-5 sm:flex-row sm:items-center sm:p-6">
                <div>
                  <h3 className="text-lg font-bold">All Transactions</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {filteredTransactions.length.toLocaleString()} matching booking records
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      value={search}
                      onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                      placeholder="Search service, customer..."
                      className="w-full rounded-xl border border-stone-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 sm:w-64"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}
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
                    {pageTransactions.map((item) => (
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
                            {statusLabel(item.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {pageTransactions.length === 0 && (
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
                  Showing {filteredTransactions.length ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(safePage * pageSize, filteredTransactions.length)} of {filteredTransactions.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={safePage <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="rounded-lg border border-stone-200 px-3 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="px-2 text-stone-500">Page {safePage} of {totalPages}</span>
                  <button
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    className="rounded-lg border border-stone-200 px-3 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>

            <footer className="py-7 text-center text-xs text-stone-400">
              FixMate Administration · Booking value is not payment-confirmation data.
            </footer>
          </>
        )}
      </div>
    </main>
  );
}







