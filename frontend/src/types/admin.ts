export interface Transaction {
  id: string;
  service_name: string;
  category: string;
  status: string;
  base_price: number;
  booking_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  provider_id: string | null;
  provider_name: string;
  address: string;
  notes: string;
}

export interface DashboardData {
  users: { customers: number; providers: number; admins: number };
  services: { total: number; active: number; inactive: number };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  recent_bookings: Array<{
    id: string;
    service_name: string;
    status: string;
    base_price: number;
    created_at: string | null;
  }>;
  transactions?: Transaction[];
  monthly_bookings?: Array<{ month: string; bookings: number }>;
  popular_services?: Array<{ name: string; bookings: number }>;
  total_booking_value?: number;
}

export interface DashboardResponse {
  success: boolean;
  dashboard: DashboardData;
}

export interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}
