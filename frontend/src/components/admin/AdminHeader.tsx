import {
  Activity,
  LogOut,
  RefreshCw,
  Wrench,
} from "lucide-react";

interface AdminHeaderProps {
  refreshing: boolean;
  loading: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}

export default function AdminHeader({
  refreshing,
  loading,
  onRefresh,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123d2b] text-white">
            <Wrench size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">FixMate</h1>
            <p className="text-xs text-stone-500">Administration portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 sm:flex">
            <Activity size={14} /> Admin account
          </span>
          <button
            onClick={onRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2.5 text-sm font-semibold hover:bg-stone-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-xl bg-[#123d2b] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1b553c]"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
