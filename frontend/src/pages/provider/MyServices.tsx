import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Plus,
  Wrench,
  RefreshCw,
  Trash2,
  X,
  LoaderCircle,
  CircleDollarSign,
  Tag,
  FileText,
} from "lucide-react";
import { apiRequest } from "../../api";

interface ProviderService {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  provider_id?: string | null;
  is_active: boolean;
  created_at?: string | null;
}

interface ServicesResponse {
  success: boolean;
  services: ProviderService[];
  message?: string;
}

interface CreateServiceResponse {
  success: boolean;
  service: ProviderService;
  message: string;
}

const emptyForm = {
  name: "",
  category: "",
  description: "",
  base_price: "",
};

const categories = [
  "Cleaning",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Appliance Repair",
  "Gardening",
  "Other",
];

export default function MyServices({ token }: { token: string }) {
  const [services, setServices] = useState<ProviderService[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest<ServicesResponse>(
        "/services/my",
        {},
        token,
      );
      setServices(result.services ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load your services.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const price = Number(form.base_price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid, non-negative price.");
      return;
    }

    setSaving(true);

    try {
      const result = await apiRequest<CreateServiceResponse>(
        "/services/provider",
        {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            category: form.category,
            description: form.description.trim(),
            base_price: price,
          }),
        },
        token,
      );

      setServices((current) => [
        result.service,
        ...current.filter(
          (service) =>
            (service._id ?? service.id) !==
            (result.service._id ?? result.service.id),
        ),
      ]);
      setForm(emptyForm);
      setShowForm(false);
      setNotice(result.message || "Service added successfully.");
      await loadServices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create the service.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(service: ProviderService) {
    const id = service._id ?? service.id;

    if (!id) {
      setError("This service has no valid ID.");
      return;
    }

    if (!window.confirm(`Deactivate "${service.name}"?`)) return;

    setError("");
    setNotice("");
    setDeactivating(id);

    try {
      const result = await apiRequest<{ success: boolean; message: string }>(
        `/services/provider/${id}`,
        { method: "DELETE" },
        token,
      );

      setServices((current) =>
        current.map((item) =>
          (item._id ?? item.id) === id ? { ...item, is_active: false } : item,
        ),
      );
      setNotice(result.message || "Service deactivated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to deactivate the service.",
      );
    } finally {
      setDeactivating(null);
    }
  }

  const activeCount = services.filter((service) => service.is_active).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Provider workspace
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Services
            </h1>
            <p className="mt-2 text-slate-600">
              Manage the home services you offer to FixMate customers.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadServices()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm((current) => !current);
                setError("");
                setNotice("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              {showForm ? "Close form" : "Add service"}
            </button>
          </div>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total listings</p>
            <p className="mt-2 text-3xl font-bold">{services.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Active services</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {activeCount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Inactive services</p>
            <p className="mt-2 text-3xl font-bold">
              {services.length - activeCount}
            </p>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {notice}
          </div>
        )}

        {showForm && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Create a service listing</h2>
              <p className="mt-1 text-sm text-slate-500">
                Provide accurate information about your service and price.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    Service name
                  </span>
                  <span className="relative block">
                    <Wrench
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      minLength={2}
                      maxLength={100}
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                      placeholder="e.g. Home deep cleaning"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    Category
                  </span>
                  <span className="relative block">
                    <Tag
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      required
                      value={form.category}
                      onChange={(event) =>
                        setForm({ ...form, category: event.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value="">Choose a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold">
                    Description
                  </span>
                  <span className="relative block">
                    <FileText
                      size={18}
                      className="absolute left-3 top-4 text-slate-400"
                    />
                    <textarea
                      required
                      minLength={5}
                      maxLength={1000}
                      rows={4}
                      value={form.description}
                      onChange={(event) =>
                        setForm({ ...form, description: event.target.value })
                      }
                      placeholder="Describe what is included in this service..."
                      className="w-full resize-y rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    Price (₱)
                  </span>
                  <span className="relative block">
                    <CircleDollarSign
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      type="number"
                      min="0"
                      max="1000000"
                      step="0.01"
                      value={form.base_price}
                      onChange={(event) =>
                        setForm({ ...form, base_price: event.target.value })
                      }
                      placeholder="e.g. 500"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm(emptyForm);
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle size={18} className="animate-spin" />
                  )}
                  {saving ? "Saving..." : "Save service"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Your listings</h2>
            <span className="text-sm text-slate-500">
              {services.length} {services.length === 1 ? "service" : "services"}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-slate-500">
              <LoaderCircle className="animate-spin" size={22} />
              Loading your services...
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Wrench size={26} />
              </div>
              <h3 className="text-lg font-bold">No services yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Add your first service listing so customers can learn what you
                offer.
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
              >
                Add your first service
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {services.map((service) => {
                const id = service._id ?? service.id ?? service.name;

                return (
                  <article
                    key={id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Wrench size={22} />
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          service.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {service.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-4 text-sm font-semibold text-emerald-700">
                      {service.category}
                    </p>
                    <h3 className="mt-1 text-xl font-bold">{service.name}</h3>
                    <p className="mt-2 min-h-10 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {service.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs text-slate-500">Starting price</p>
                        <p className="mt-1 text-xl font-bold">
                          ₱
                          {Number(service.base_price).toLocaleString("en-PH", {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      {service.is_active && (
                        <button
                          type="button"
                          onClick={() => void handleDeactivate(service)}
                          disabled={deactivating === id}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          {deactivating === id ? (
                            <LoaderCircle
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          Deactivate
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
