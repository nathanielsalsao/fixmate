import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../api";
import type { AuthUser } from "../../api";

type Props = {
  token: string;
  user: AuthUser;
};

type Booking = Record<string, unknown>;

function getBookings(result: unknown): Booking[] {
  if (Array.isArray(result)) {
    return result.filter(
      (item): item is Booking =>
        item !== null && typeof item === "object" && !Array.isArray(item)
    );
  }

  if (!result || typeof result !== "object") return [];

  const data = result as Record<string, unknown>;

  for (const key of ["bookings", "data", "items"]) {
    if (Array.isArray(data[key])) {
      return getBookings(data[key]);
    }
  }

  return [];
}

function getText(value: unknown, fallback = ""): string {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function formatDate(value: unknown): string {
  const text = getText(value);

  if (!text) return "Schedule not provided";

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) return text;

  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatPrice(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Price not provided";
  }

  const price = Number(value);

  if (!Number.isFinite(price)) return "Price not provided";

  return price.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  });
}

function getStatus(booking: Booking): string {
  return getText(booking.status, "pending")
    .toLowerCase()
    .replaceAll("_", " ")
    .trim();
}

function statusStyle(status: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-800";
    case "confirmed":
    case "accepted":
      return "bg-blue-50 text-blue-800";
    case "in progress":
      return "bg-violet-50 text-violet-800";
    case "completed":
      return "bg-emerald-50 text-emerald-800";
    case "cancelled":
    case "canceled":
      return "bg-red-50 text-red-800";
    default:
      return "bg-stone-100 text-stone-700";
  }
}

export default function ProviderBookings({ token, user }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const loadBookings = useCallback(
    async (background = false) => {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const result = await apiRequest<unknown>("/bookings", {}, token);
        setBookings(getBookings(result));
        setLastUpdated(Date.now());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load bookings."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    void loadBookings();

    const refreshId = window.setInterval(() => {
      void loadBookings(true);
    }, 10000);

    return () => window.clearInterval(refreshId);
  }, [loadBookings]);

  const pendingCount = bookings.filter(
    (booking) => getStatus(booking) === "pending"
  ).length;

  const activeCount = bookings.filter((booking) =>
    ["confirmed", "accepted", "in progress"].includes(getStatus(booking))
  ).length;

  const completedCount = bookings.filter(
    (booking) => getStatus(booking) === "completed"
  ).length;

  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(
      getText(a.created_at, getText(a.booking_date))
    ).getTime();

    const dateB = new Date(
      getText(b.created_at, getText(b.booking_date))
    ).getTime();

    return (
      (Number.isNaN(dateB) ? 0 : dateB) -
      (Number.isNaN(dateA) ? 0 : dateA)
    );
  });

  return (
    <main className="min-h-screen bg-[#f5f7f3] p-6 sm:p-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wider text-emerald-800">
            FIXMATE PROVIDER
          </p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            My Bookings
          </h1>

          <p className="mt-2 text-stone-500">
            Hello, {user.name}. Review and monitor your assigned jobs.
          </p>

          <p className="mt-2 text-xs text-stone-400">
            {lastUpdated
              ? `Last updated: ${new Date(lastUpdated).toLocaleTimeString("en-PH")}`
              : "Connecting to your bookings..."}
            {refreshing ? " · Updating..." : " · Auto-refreshes every 10 seconds"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadBookings(true)}
          disabled={loading || refreshing}
          className="rounded-xl bg-[#123d2b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1b503a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "Refresh bookings"}
        </button>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Bookings",
            value: bookings.length,
            detail: "All assigned requests",
          },
          {
            label: "Pending Requests",
            value: pendingCount,
            detail: "Awaiting your response",
          },
          {
            label: "Active Jobs",
            value: activeCount,
            detail: "Confirmed or in progress",
          },
          {
            label: "Completed Jobs",
            value: completedCount,
            detail: "Finished services",
          },
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-stone-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-bold text-stone-900">
              {loading ? "…" : stat.value}
            </p>
            <p className="mt-2 text-xs text-stone-400">{stat.detail}</p>
          </article>
        ))}
      </section>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700"
        >
          <p className="font-semibold">Unable to load bookings</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => void loadBookings()}
            className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      )}

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-stone-900">All Bookings</h2>
          <p className="mt-1 text-sm text-stone-500">
            View the appointment schedule, service details, and request status.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-stone-500">
            Loading your bookings...
          </div>
        ) : !error && sortedBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <h3 className="font-semibold text-stone-800">
              No bookings yet
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              Customer requests for your services will appear here when they
              are assigned to your account.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedBookings.map((booking, index) => {
              const status = getStatus(booking);
              const id = getText(
                booking.id,
                getText(booking._id, String(index))
              );

              const serviceName = getText(
                booking.service_name,
                getText(
                  booking.serviceName,
                  getText(booking.service, "Home service booking")
                )
              );

              const schedule =
                booking.booking_date ??
                booking.scheduled_date ??
                booking.date;

              const price = booking.base_price ?? booking.price;

              const customerName = getText(
                booking.customer_name,
                getText(
                  booking.customerName,
                  "Customer details unavailable"
                )
              );

              const address = getText(booking.address);
              const notes = getText(booking.notes);
              const createdAt = getText(booking.created_at);

              return (
                <article
                  key={id}
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-300 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-stone-900">
                        {serviceName}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500">
                        {getText(booking.category, "Home service")}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusStyle(status)}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        Appointment
                      </p>
                      <p className="mt-1 text-sm text-stone-700">
                        {formatDate(schedule)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        Service Price
                      </p>
                      <p className="mt-1 text-sm font-semibold text-stone-800">
                        {formatPrice(price)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        Customer
                      </p>
                      <p className="mt-1 text-sm text-stone-700">
                        {customerName}
                      </p>
                    </div>
                  </div>

                  {address.trim().length > 0 && (
                    <div className="mt-4 border-t border-stone-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        Service Address
                      </p>
                      <p className="mt-1 text-sm text-stone-700">
                        {address}
                      </p>
                    </div>
                  )}

                  {notes.trim().length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        Customer Notes
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-stone-700">
                        {notes}
                      </p>
                    </div>
                  )}

                  {createdAt.trim().length > 0 && (
                    <p className="mt-4 border-t border-stone-100 pt-3 text-xs text-stone-400">
                      Request submitted: {formatDate(createdAt)}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
