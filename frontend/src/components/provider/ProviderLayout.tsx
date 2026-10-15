import type { ReactNode } from "react";
import type { AuthUser } from "../../api";
import ProviderSidebar from "./ProviderSidebar";

type Props = {
  user: AuthUser;
  onLogout: () => void;
  children: ReactNode;
};

export default function ProviderLayout({ user, onLogout, children }: Props) {
  return (
    <div className="min-h-screen bg-[#f5f7f3]">
      <ProviderSidebar userName={user.name} onLogout={onLogout} />
      <div className="min-h-screen min-w-0 pl-64">
        {children}
      </div>
    </div>
  );
}
