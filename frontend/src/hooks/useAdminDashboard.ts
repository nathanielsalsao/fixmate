import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../api";
import type { DashboardData, DashboardResponse } from "../types/admin";

export function useAdminDashboard(token: string) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await apiRequest<DashboardResponse>(
        "/admin/dashboard",
        {},
        token
      );

      setDashboard(result.dashboard);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return {
    dashboard,
    loading,
    refreshing,
    error,
    loadDashboard,
  };
}
