import type { AuthUser } from "../../api";

type Props = { user: AuthUser };

export default function ProviderProfile({ user }: Props) {
  return (
    <main className="min-h-screen bg-[#f5f7f3] p-6 sm:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-800">FIXMATE PROVIDER</p>
          <h1 className="mt-2 text-3xl font-bold text-stone-900">My Profile</h1>
        </div>
      </header>

      <section className="mt-8 max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-2xl font-bold text-emerald-900">
          {user.name.trim().charAt(0).toUpperCase()}
        </div>
        <h2 className="mt-5 text-xl font-bold text-stone-900">{user.name}</h2>
        <p className="mt-1 text-stone-500">{user.email}</p>
        <div className="mt-6 border-t border-stone-100 pt-4">
          <p className="text-sm text-stone-500">Account role</p>
          <p className="mt-1 font-semibold capitalize text-stone-900">{user.role}</p>
        </div>
        <p className="mt-5 text-sm text-stone-500">
          This information comes from the user object returned by your existing login API.
        </p>
      </section>
    </main>
  );
}

