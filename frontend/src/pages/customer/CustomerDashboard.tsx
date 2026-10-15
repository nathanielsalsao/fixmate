import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  CalendarCheck,
  Clock,
  LogOut,
  Search,
  UserRound,
  Wrench,
  X,
  RefreshCw,
} from "lucide-react";
import { apiRequest } from "../../api";
import type { AuthUser } from "../../api";

interface CustomerDashboardProps {
  user: AuthUser;
  token: string;
  onLogout: () => void;
}

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  calculated_price?: number;
  provider_id?: string | null;
}

interface Booking {
  id: string;
  service_id: string;
  service_name: string;
  category?: string;
  base_price: number;
  booking_date: string | null;
  address: string;
  notes?: string;
  status: string;
}

interface ServicesResponse {
  success: boolean;
  services: Service[];
  message?: string;
}

interface BookingsResponse {
  success: boolean;
  bookings: Booking[];
  message?: string;
}

interface BookingResponse {
  success: boolean;
  message: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDate(value: string | null) {
  if (!value) return "Date not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date not available"
    : date.toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function localDateTimeMinimum() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function statusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-blue-50 text-blue-700";
    case "in_progress":
      return "bg-amber-50 text-amber-700";
    case "completed":
      return "bg-emerald-50 text-emerald-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-stone-100 text-stone-700";
  }
}

export default function CustomerDashboard({
  user,
  token,
  onLogout,
}: CustomerDashboardProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const result = await apiRequest<ServicesResponse>("/services");
      setServices(Array.isArray(result.services) ? result.services : []);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load services."
      );
    } finally {
      setLoadingServices(false);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const result = await apiRequest<BookingsResponse>(
        "/bookings",
        {},
        token
      );
      setBookings(Array.isArray(result.bookings) ? result.bookings : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load your bookings."
      );
    } finally {
      setLoadingBookings(false);
    }
  }, [token]);

  useEffect(() => {
    void loadServices();
    void loadBookings();
  }, [loadServices, loadBookings]);

  const filteredServices = services.filter((service) => {
    const searchText =
      `${service.name} ${service.category} ${service.description}`.toLowerCase();
    return searchText.includes(search.toLowerCase());
  });

  async function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedService) return;

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const result = await apiRequest<BookingResponse>(
        "/bookings",
        {
          method: "POST",
          body: JSON.stringify({
            service_id: selectedService.id,
            booking_date: new Date(bookingDate).toISOString(),
            address: address.trim(),
            notes: notes.trim(),
          }),
        },
        token
      );

      setNotice(result.message || "Your booking was created.");
      setSelectedService(null);
      setBookingDate("");
      setAddress("");
      setNotes("");
      await loadBookings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create your booking."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelBooking(booking: Booking) {
    if (
      !window.confirm(
        `Cancel your booking for ${booking.service_name}?`
      )
    ) {
      return;
    }

    setError("");
    setNotice("");

    try {
      const result = await apiRequest<BookingResponse>(
        `/bookings/${booking.id}/cancel`,
        { method: "PATCH", body: JSON.stringify({}) },
        token
      );
      setNotice(result.message || "Booking cancelled.");
      await loadBookings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to cancel this booking."
      );
    }
  }

  const activeBookings = bookings.filter(
    (booking) => !["completed", "cancelled"].includes(booking.status)
  );

  return (
    <main className="min-h-screen bg-[#f5f7f3] text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123d2b] text-white">
              <Wrench size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold">FixMate</h1>
              <p className="text-xs text-stone-500">Customer Portal</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="rounded-3xl bg-[#123d2b] p-7 text-white sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-lime-300">
            CUSTOMER DASHBOARD
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Welcome, {user.name}!
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-emerald-50/80">
            Find trusted home services, book a convenient schedule, and track
            your requests in one place.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm">
            <a
              href="#services"
              className="rounded-xl bg-lime-300 px-5 py-3 font-bold text-[#123d2b] transition hover:bg-lime-200"
            >
              Browse services
            </a>
            <a
              href="#bookings"
              className="rounded-xl border border-white/30 px-5 py-3 font-bold text-white transition hover:bg-white/10"
            >
              My bookings ({activeBookings.length})
            </a>
          </div>
        </section>

        {(error || notice) && (
          <div
            role="status"
            className={`mt-6 flex items-start justify-between gap-4 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <p>{error || notice}</p>
            <button
              aria-label="Dismiss message"
              onClick={() => {
                setError("");
                setNotice("");
              }}
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section id="services" className="scroll-mt-24 pt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h3 className="text-2xl font-bold">Browse services</h3>
              <p className="mt-2 text-sm text-stone-500">
                Choose a service to request a booking.
              </p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search services or categories..."
                className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10"
              />
            </label>
          </div>

          {loadingServices ? (
            <p className="mt-8 text-sm text-stone-500">Loading services...</p>
          ) : filteredServices.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
              <Wrench className="mx-auto text-stone-400" size={30} />
              <h4 className="mt-3 font-bold">
                {services.length === 0
                  ? "No services available yet"
                  : "No matching services"}
              </h4>
              <p className="mt-2 text-sm text-stone-500">
                {services.length === 0
                  ? "Services added by providers will appear here once they are available in the catalogue."
                  : "Try another service name or category."}
              </p>
              <button
                onClick={() => void loadServices()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold hover:bg-stone-50"
              >
                <RefreshCw size={15} /> Refresh
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <article
                  key={service.id}
                  className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <Wrench size={23} />
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    {service.category}
                  </p>
                  <h4 className="mt-2 text-lg font-bold">{service.name}</h4>
                  <p className="mt-2 flex-1 text-sm leading-6 text-stone-500">
                    {service.description || "Home service provided through FixMate."}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
                    <div>
                      <p className="text-xs text-stone-500">Starting price</p>
                      <p className="mt-1 font-bold text-[#123d2b]">
                        {formatPrice(service.base_price)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setError("");
                        setNotice("");
                      }}
                      className="rounded-xl bg-[#123d2b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1c543b]"
                    >
                      Book now
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="bookings" className="scroll-mt-24 pt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-bold">My bookings</h3>
              <p className="mt-2 text-sm text-stone-500">
                Review your requests and check their current status.
              </p>
            </div>
            <button
              onClick={() => void loadBookings()}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-stone-50"
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>

          {loadingBookings ? (
            <p className="mt-6 text-sm text-stone-500">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-8 text-center">
              <CalendarCheck className="mx-auto text-stone-400" size={30} />
              <h4 className="mt-3 font-bold">No bookings yet</h4>
              <p className="mt-2 text-sm text-stone-500">
                Choose a service above to make your first booking.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {bookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-bold">
                          {booking.service_name}
                        </h4>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle(
                            booking.status
                          )}`}
                        >
                          {booking.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-stone-500">
                        {booking.category || "Home service"}
                      </p>
                    </div>
                    <p className="font-bold text-[#123d2b]">
                      {formatPrice(booking.base_price)}
                    </p>
                  </div>
                  <div className="mt-5 grid gap-3 text-sm text-stone-600 sm:grid-cols-2">
                    <p className="flex items-start gap-2">
                      <Clock size={17} className="mt-0.5 shrink-0" />
                      {formatDate(booking.booking_date)}
                    </p>
                    <p className="flex items-start gap-2">
                      <UserRound size={17} className="mt-0.5 shrink-0" />
                      {booking.address}
                    </p>
                  </div>
                  {booking.notes && (
                    <p className="mt-3 text-sm text-stone-500">
                      Notes: {booking.notes}
                    </p>
                  )}
                  {["pending", "confirmed"].includes(
                    booking.status.toLowerCase()
                  ) && (
                    <div className="mt-5 border-t border-stone-100 pt-4">
                      <button
                        onClick={() => void handleCancelBooking(booking)}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        Cancel booking
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-5">
          <UserRound size={20} className="mt-0.5 shrink-0 text-emerald-800" />
          <div>
            <h4 className="font-semibold">Your account</h4>
            <p className="mt-1 text-sm text-stone-500">{user.email}</p>
            <p className="mt-1 text-xs capitalize text-stone-400">
              Role: {user.role}
            </p>
          </div>
        </section>
      </div>

      {selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              setSelectedService(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            className="my-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                  New booking
                </p>
                <h3 id="booking-title" className="mt-2 text-2xl font-bold">
                  {selectedService.name}
                </h3>
                <p className="mt-2 text-sm text-stone-500">
                  Starting at {formatPrice(selectedService.base_price)}
                </p>
              </div>
              <button
                disabled={submitting}
                aria-label="Close booking form"
                onClick={() => setSelectedService(null)}
                className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Preferred date and time
                </span>
                <input
                  required
                  type="datetime-local"
                  min={localDateTimeMinimum()}
                  value={bookingDate}
                  onChange={(event) => setBookingDate(event.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Service address
                </span>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="House number, street, barangay, city..."
                  className="w-full resize-y rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Additional notes (optional)
                </span>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Describe the issue or special instructions..."
                  className="w-full resize-y rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10"
                />
              </label>

              <div className="rounded-xl bg-stone-50 p-4 text-sm text-stone-600">
                Your request will be submitted with a pending status. The
                displayed price is the provider's starting price.
              </div>

              <button
                type="submit"
                disabled={
                  submitting ||
                  !bookingDate ||
                  !address.trim() ||
                  new Date(bookingDate).getTime() <= Date.now()
                }
                className="w-full rounded-xl bg-[#123d2b] px-5 py-3.5 font-bold text-white transition hover:bg-[#1c543b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting booking..." : "Confirm booking request"}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
