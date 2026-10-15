import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Wrench } from "lucide-react";
import { apiRequest } from "../../api";

type AccountRole = "customer" | "provider";

interface RegisterResponse {
  success: boolean;
  message: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer" as AccountRole,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiRequest<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setSuccess(result.message || "Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#245b40] focus:ring-2 focus:ring-[#245b40]/10";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f3] px-4 py-10 text-stone-900">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-[#123d2b]"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <section className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-9">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#123d2b] text-white">
              <Wrench size={23} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">FixMate</h1>
              <p className="text-sm text-stone-500">Create your account</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf1eb] text-[#123d2b]">
              <UserPlus size={20} />
            </div>
            <h2 className="text-xl font-bold">Join FixMate</h2>
            <p className="mt-1 text-sm text-stone-500">
              Create an account to get started.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
            >
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-sm font-medium"
              >
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                className={inputClass}
                minLength={8}
                required
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-1.5 block text-sm font-medium"
              >
                Register as
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="customer">Customer</option>
                <option value="provider">Service Provider</option>
              </select>
              <p className="mt-1.5 text-xs text-stone-500">
                Admin accounts cannot be created through public registration.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123d2b] px-4 py-3 font-semibold text-white transition hover:bg-[#1b5038] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus size={18} />
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#245b40] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </section>

        <p className="mt-5 text-center text-xs text-stone-400">
          FixMate · Home services made simpler
        </p>
      </div>
    </main>
  );
}
