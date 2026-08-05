// ============ TYPES POUR LES ARTICLES (UTILISATEUR) ============
export type Status = "Publié" | "Brouillon";

export interface DisplayArticle {
  id: string;
  tag: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  status: "Publié";
}

// ============ TYPES POUR LES TEMPLATES (UTILISATEUR) ============
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
  title: string;
  description: string;
  full_description: string;
  category: string;
  cover_image: string;
  preview_images: string;
  features: string;
  delivery_time: string;
  price: number;
  submitted_by: string;
  submitted_email: string;
  submitted_phone: string;
}

export interface OrderFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_message: string;
}