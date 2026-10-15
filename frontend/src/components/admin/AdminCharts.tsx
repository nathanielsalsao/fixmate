import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { DashboardData } from "../../types/admin";

interface AdminChartsProps {
  dashboard: DashboardData;
}

const COLORS = ["#eab308", "#3b82f6", "#8b5cf6", "#16a34a", "#ef4444"];
const GREEN = "#176b45";

export default function AdminCharts({ dashboard }: AdminChartsProps) {
  const statusData = [
    { name: "Pending", value: dashboard.bookings.pending },
    { name: "Confirmed", value: dashboard.bookings.confirmed },
    { name: "In Progress", value: dashboard.bookings.in_progress },
    { name: "Completed", value: dashboard.bookings.completed },
    { name: "Cancelled", value: dashboard.bookings.cancelled },
  ].filter((item) => item.value > 0);

  return (
    <>
      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="font-bold">Booking Status Distribution</h3>
          <p className="mt-1 text-sm text-stone-500">Breakdown of all booking records</p>
          <div className="mt-4 h-[290px]">
            {statusData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="47%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"].indexOf(entry.name)]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [Number(value), "Bookings"]} />
                  <Legend verticalAlign="bottom" height={35} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-stone-400">
                No bookings to chart yet.
              </div>
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
              <div className="flex h-full items-center justify-center text-sm text-stone-400">
                No service activity yet.
              </div>
            )}
          </div>
        </article>
      </section>
    </>
  );
}
