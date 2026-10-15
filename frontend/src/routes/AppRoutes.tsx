import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import type { AuthUser } from "../api";
import LoginPage from "../pages/Login/LoginPage";
import WelcomeIntro from "../components/WelcomeIntro";
import RegisterPage from "../pages/Register/RegisterPage";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ProviderDashboard from "../pages/provider/ProviderDashboard";
import ProviderBookings from "../pages/provider/ProviderBookings";
import ProviderProfile from "../pages/provider/ProviderProfile";
import MyServices from "../pages/provider/MyServices";
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import ProviderLayout from "../components/provider/ProviderLayout";

type Session = {
  user: AuthUser;
  token: string;
};

const SESSION_KEY = "fixmate_session";

function getSavedSession(): Session | null {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved) as Session;

    if (!parsed.user || !parsed.token) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    return parsed;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function AppRoutes() {
  const [session, setSession] = useState<Session | null>(getSavedSession);

  function handleLogin(user: AuthUser, token: string) {
    const newSession = { user, token };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  const isProvider = session?.user.role === "provider";

  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />

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
            <>
              <WelcomeIntro />
              <LoginPage onLogin={handleLogin} />
            </>
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
          isProvider && session ? (
            <ProviderLayout user={session.user} onLogout={handleLogout}>
              <ProviderDashboard token={session.token} user={session.user} />
            </ProviderLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/provider/bookings"
        element={
          isProvider && session ? (
            <ProviderLayout user={session.user} onLogout={handleLogout}>
              <ProviderBookings token={session.token} user={session.user} />
            </ProviderLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/provider/services"
        element={
          isProvider && session ? (
            <ProviderLayout user={session.user} onLogout={handleLogout}>
              <MyServices token={session.token} />
            </ProviderLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/provider/profile"
        element={
          isProvider && session ? (
            <ProviderLayout user={session.user} onLogout={handleLogout}>
              <ProviderProfile user={session.user} />
            </ProviderLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/customer"
        element={
          session?.user.role === "customer" ? (
            <CustomerDashboard
              user={session.user}
              token={session.token}
              onLogout={handleLogout}
            />
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

export default AppRoutes;
