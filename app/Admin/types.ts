// ============ TYPES POUR LES ARTICLES ============
export type Status = "Publié" | "Brouillon";

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: Status;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  reading_time: number;
}

export interface FormData {
  id?: string;
  title: string;
  slug: string;
  category: string;
  status: Status;
  content: string;
  excerpt: string;
  cover_image: string;
}

// ============ TYPES POUR LES TEMPLATES ============
export type TemplateStatus = "draft" | "published" | "pending" | "approved" | "rejected";

export interface Template {
  id: string;
  title: string;
  slug: string;
  description: string;
  full_description: string | null;
  category: string;
  cover_image: string | null;
  preview_images: string[] | null;
  features: string | null;
  delivery_time: string | null;
  price: number;
  status: TemplateStatus;
  submitted_by: string | null;
  submitted_email: string | null;
  submitted_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateFormData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  full_description: string;
  category: string;
  cover_image: string;
  preview_images: string;
  features: string;
  delivery_time: string;
  price: number;
  status: TemplateStatus;
  submitted_by?: string;
  submitted_email?: string;
  submitted_phone?: string;
}

// ============ TYPES POUR LES COMMANDES ============
export interface TemplateOrder {
  id: string;
  template_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_message: string | null;
  status: "pending" | "processing" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  template?: Template;
}

// ============ TYPES POUR LES NOTIFICATIONS ============
export interface TemplateNotification {
  id: string;
  template_id: string;
  type: "submission" | "approval" | "rejection";
  message: string;
  read: boolean;
  created_at: string;
  template?: Template;
}