export type Category = "grooming" | "wellness" | "beauty-kit" | "kitchen" | "offer";

export interface Product {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  description: string | null;
  features: string[];
  specs: { label: string; value: string }[];
  category: Category;
  price: number;
  compare_at_price: number | null;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  warranty_months: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
}

export interface ProductWithImages extends Product {
  images: ProductImage[];
  product_images?: ProductImage[];
}

export type OrderStatus = "new" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  qty: number;
}

export interface Order {
  id: string;
  order_no: string;
  customer_name: string;
  phone: string;
  address: string;
  area: "dhaka" | "outside";
  delivery_charge: number;
  total: number;
  note: string | null;
  status: OrderStatus;
  created_at: string;
  items?: OrderItemRow[];
}

export interface Review {
  id: string;
  customer_name: string;
  quote: string;
  rating: number;
  photo_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface StoreSettings {
  whatsapp_number: string;
  messenger_url: string;
  instagram_url: string;
  email: string;
  delivery_dhaka: number;
  delivery_outside: number;
  announcement: string;
  hero_product_id: string | null;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  grooming: "গ্রুমিং",
  wellness: "ওয়েলনেস",
  "beauty-kit": "বিউটি কিট",
  kitchen: "কিচেন",
  offer: "অফার",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "নতুন",
  confirmed: "কনফার্মড",
  shipped: "শিপড",
  delivered: "ডেলিভার্ড",
  cancelled: "বাতিল",
};

export const DEFAULT_SETTINGS: StoreSettings = {
  whatsapp_number: "",
  messenger_url: "https://www.facebook.com/safaTuZen",
  instagram_url: "https://www.instagram.com/safatuzen/",
  email: "safatuzen24250@gmail.com",
  delivery_dhaka: 60,
  delivery_outside: 120,
  announcement: "🚚 সারা বাংলাদেশে ক্যাশ অন ডেলিভারি",
  hero_product_id: null,
};
