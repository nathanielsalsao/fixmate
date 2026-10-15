import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Wrench,
  UserRound,
  LogOut,
  Hammer,
} from "lucide-react";

type Props = {
  userName: string;
  onLogout: () => void;
};

const links = [
  { label: "Dashboard", to: "/provider", icon: LayoutDashboard, end: true },
  { label: "My Bookings", to: "/provider/bookings", icon: CalendarDays },
  { label: "My Services", to: "/provider/services", icon: Wrench },
  { label: "Profile", to: "/provider/profile", icon: UserRound },
];

export default function ProviderSidebar({ userName, onLogout }: Props) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-[#123d2b] text-white">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Hammer size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide">FixMate</h1>
          <p className="text-xs text-emerald-100/70">Provider Portal</p>
        </div>
      </div>

      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-xs text-emerald-100/60">SIGNED IN AS</p>
        <p className="mt-1 truncate text-sm font-semibold">{userName}</p>
        <p className="mt-1 text-xs text-emerald-100/60">Service Provider</p>
      </div>

      <div className="px-4 pt-6">
        <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-widest text-emerald-100/50">
          Workspace
        </p>
        <nav className="space-y-2">
          {links.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-emerald-50/75 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-emerald-50/75 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={19} strokeWidth={1.8} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
