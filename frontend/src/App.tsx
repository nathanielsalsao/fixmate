import { useState, type FormEvent } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Home,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { login, type AuthUser } from "./api";
import AdminDashboard from "./pages/admin/AdminDashboard";

function LoginPage({
  onLogin,
}: {
  onLogin: (user: AuthUser, token: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email.trim(), password);

      if (!result.token || !result.user) {
        throw new Error("The backend did not return a token and user.");
      }

      onLogin(result.user, result.token);

      if (result.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (result.user.role === "provider") {
        navigate("/provider", { replace: true });
      } else {
        navigate("/customer", { replace: true });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#123d2b] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="pointer-events-none absolute -right-32 top-28 h-96 w-96 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

        <a href="/" className="relative flex w-fit items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-950">
            <Wrench size={23} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight">FixMate</span>
        </a>

        <div className="relative max-w-xl py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-lime-300" />
            Home services, made simple
          </span>

          <h1 className="mt-8 text-5xl font-semibold leading-[1.15] tracking-tight xl:text-6xl">
            Your home deserves
            <span className="block text-lime-300">the right hands.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-8 text-emerald-100/80">
            Find trusted home services, book a professional, and keep track of
            every appointment in one convenient place.
          </p>

          <div className="mt-10 space-y-5">
            {[
              "Book home services with ease",
              "Manage your appointments in one place",
              "Stay updated on your booking status",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-emerald-50">
                <CheckCircle2 size={19} className="shrink-0 text-lime-300" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-sm text-emerald-100/60">
          <ShieldCheck size={18} />
          Simple. Convenient. Reliable.
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-md">
          <a href="/" className="mb-12 flex w-fit items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123d2b] text-white">
              <Wrench size={21} />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900">
              FixMate
            </span>
          </a>

          <div className="mb-9">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-800">
              Welcome back
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-stone-900">
              Sign in to FixMate
            </h2>
            <p className="mt-3 leading-7 text-stone-500">
              Enter your account details to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-stone-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-4 focus:ring-emerald-900/10"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-stone-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 pr-12 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-4 focus:ring-emerald-900/10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-stone-400 transition hover:text-stone-700"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#123d2b] px-5 py-4 font-semibold text-white transition hover:bg-[#1b523a] focus:outline-none focus:ring-4 focus:ring-emerald-900/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-xs text-stone-400">SECURE SIGN IN</span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4">
            <ShieldCheck size={21} className="mt-0.5 shrink-0 text-emerald-800" />
            <p className="text-sm leading-6 text-stone-500">
              Your sign-in is verified by the FixMate backend using Flask and MongoDB.
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-stone-400">
            FixMate · Home Service Booking System
          </p>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [session, setSession] = useState<{
    user: AuthUser;
    token: string;
  } | null>(null);

  function handleLogout() {
    setSession(null);
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          session ? (
            <Navigate
              to={
                session.user.role === "admin"
                  ? "/admin"
                  : session.user.role === "provider"
                    ? "/provider"
                    : "/customer"
              }
              replace
            />
          ) : (
            <LoginPage
              onLogin={(user, token) => setSession({ user, token })}
            />
          )
        }
      />

      <Route
        path="/admin"
        element={
          session?.user.role === "admin" ? (
            <AdminDashboard token={session.token} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/provider"
        element={
          session?.user.role === "provider" ? (
            <main className="min-h-screen bg-[#f5f7f3] p-10">
              <h1 className="text-3xl font-bold">Provider Dashboard</h1>
              <p className="mt-3 text-stone-500">We'll build this page next.</p>
              <button onClick={handleLogout} className="mt-6 rounded-xl bg-[#123d2b] px-5 py-3 font-semibold text-white">
                Sign out
              </button>
            </main>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/customer"
        element={
          session?.user.role === "customer" ? (
            <main className="min-h-screen bg-[#f5f7f3] p-10">
              <h1 className="text-3xl font-bold">Customer Dashboard</h1>
              <p className="mt-3 text-stone-500">We'll build this page next.</p>
              <button onClick={handleLogout} className="mt-6 rounded-xl bg-[#123d2b] px-5 py-3 font-semibold text-white">
                Sign out
              </button>
            </main>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
