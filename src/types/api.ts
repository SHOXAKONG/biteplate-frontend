export type Role =
  | "admin"
  | "manager"
  | "head_chef"
  | "waiter"
  | "cashier"
  | "customer";

export interface CurrentUser {
  sub: string;
  username: string;
  email: string | null;
  roles: Role[];
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  scope?: string | null;
}

export interface UserCreated {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface StaffUser {
  id: string;
  username: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  enabled: boolean;
  roles: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  category: string;
  is_combo: boolean;
  parent_id: string | null;
  location_code: string;
  available: boolean;
  allergens: string[];
}

export interface MenuItemCreate {
  name: string;
  description?: string;
  base_price: number;
  category?: string;
  is_combo?: boolean;
  parent_id?: string | null;
  allergens?: string[];
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: string;
  current_order_id: string | null;
}

export interface Reservation {
  id: string;
  table_id: string;
  customer_sub: string;
  customer_name: string;
  customer_phone: string;
  party_size: number;
  booking_time: string;
  status: string;
}

export interface OrderItem {
  id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  decorators: Record<string, unknown>[];
  status: string;
}

export interface Order {
  id: string;
  table_id: string;
  waiter_sub: string;
  status: string;
  subtotal: number;
  total: number;
  pricing_strategy: string;
  notes: string | null;
  items: OrderItem[];
}

export interface KitchenSnapshot {
  pending: Array<Record<string, unknown>>;
  in_progress: Array<Record<string, unknown>>;
  completed: Array<Record<string, unknown>>;
  history_size: number;
}

export interface Bill {
  id: string;
  order_id: string;
  subtotal: number;
  tax: number;
  total: number;
  splits: Array<{ index: number; amount: number }>;
  pricing_strategy: string;
  status: string;
  cashier_sub: string | null;
  payment_method: string | null;
  created_at: string | null;
}

export interface TopItem {
  name: string;
  times_ordered: number;
  revenue: number;
}
