import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  Clock,
  LogOut,
  Users,
  Wrench,
} from "lucide-react";
import { apiRequest } from "../../api";

interface DashboardData {
  users: {
    customers: number;
    providers: number;
    admins: number;
  };
  services: {
    total: number;
    active: number;
    inactive: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  recent_bookings: Array<{
    id: string;
    service_name: string;
    status: string;
    base_price: number;
    created_at: string;
  }>;
}

interface DashboardResponse {
  success: boolean;
  dashboard: DashboardData;
}

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

export default function AdminDashboard({
  token,
  onLogout,
}: AdminDashboardProps) {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const result = await apiRequest<DashboardResponse>(
          "/admin/dashboard",
          {},
          token
        );

        if (active) {
          setDashboard(result.dashboard);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load the admin dashboard."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [token]);

  function handleLogout() {
    onLogout();
    navigate("/login", { replace: true });
  }

  const stats = dashboard
    ? [
        {
          label: "Total Users",
          value:
            dashboard.users.customers +
            dashboard.users.providers +
            dashboard.users.admins,
          detail: `${dashboard.users.customers} customers`,
          icon: Users,
        },
        {
          label: "Active Services",
          value: dashboard.services.active,
          detail: `${dashboard.services.total} total services`,
          icon: Wrench,
        },
        {
          label: "Total Bookings",
          value: dashboard.bookings.total,
          detail: `${dashboard.bookings.pending} pending`,
          icon: CalendarCheck,
        },
        {
          label: "Completed Jobs",
          value: dashboard.bookings.completed,
          detail: `${dashboard.bookings.in_progress} in progress`,
          icon: CheckCircle2,
        },
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#f5f7f3] text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123d2b] text-white">
              <Wrench size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold">FixMate</h1>
              <p className="text-xs text-stone-500">Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 sm:inline-flex">
              <Activity size={14} className="mr-1.5" />
              Admin account
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <div className="mb-9">
          <p className="text-sm font-semibold text-emerald-800">
            OVERVIEW
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Admin Dashboard
          </h2>
          <p className="mt-3 text-stone-500">
            Monitor your users, services, and home service bookings.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-stone-500">
            Loading dashboard data from FixMate...
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p className="font-semibold">Could not load dashboard data</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {dashboard && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <article
                    key={stat.label}
                    className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-900/[0.02]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-stone-500">
                        {stat.label}
                      </p>
                      <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-800">
                        <Icon size={20} />
                      </div>
                    </div>
                    <p className="mt-5 text-3xl font-bold">{stat.value}</p>
                    <p className="mt-2 text-sm text-stone-500">
                      {stat.detail}
                    </p>
                  </article>
                );
              })}
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
              <article className="rounded-2xl border border-stone-200 bg-white p-6">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-emerald-800" />
                  <h3 className="text-lg font-bold">Booking Status</h3>
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    ["Pending", dashboard.bookings.pending],
                    ["Confirmed", dashboard.bookings.confirmed],
                    ["In Progress", dashboard.bookings.in_progress],
                    ["Completed", dashboard.bookings.completed],
                    ["Cancelled", dashboard.bookings.cancelled],
                  ].map(([label, count]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">{label}</span>
                      <span className="rounded-lg bg-stone-100 px-3 py-1 text-sm font-bold">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-stone-200 bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold">Recent Bookings</h3>
                  <span className="text-xs text-stone-400">Latest 5 records</span>
                </div>

                {dashboard.recent_bookings.length === 0 ? (
                  <p className="mt-6 text-sm text-stone-500">
                    No bookings to display yet.
                  </p>
                ) : (
                  <div className="mt-5 space-y-3">
                    {dashboard.recent_bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-col justify-between gap-2 rounded-xl bg-stone-50 p-4 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {booking.service_name}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            {new Date(booking.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-sm font-semibold">
                            ₱{booking.base_price.toLocaleString()}
                          </span>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-900">
                            {booking.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
