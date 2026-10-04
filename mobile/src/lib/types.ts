// Mirrors src/lib/types.ts in the website.
export type DeviceKind = "laptop" | "phone" | "monitor" | "keyboard" | "mouse" | "headphones" | "charger" | "ssd";

export type Category = { id: string; slug: string; name: string; description: string; kind: DeviceKind; sort_order: number };

export type Product = {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  price_cents: number;
  compare_at_cents: number | null;
  stock: number;
  specs: Record<string, string>;
  image_url: string | null;
  accent: string;
  featured: boolean;
  category?: Pick<Category, "slug" | "name" | "kind"> | null;
};

export type Order = {
  id: string;
  order_number: string;
  email: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  payment_method: "pay_on_delivery" | "bank_transfer";
  email_sent_at: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  product_name: string;
  product_slug: string | null;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
};

export const PRODUCT_SELECT = "*, category:categories(slug, name, kind)";
