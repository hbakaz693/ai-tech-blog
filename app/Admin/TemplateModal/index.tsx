"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Template, TemplateFormData } from "../types/page";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TemplateFormData) => Promise<void>;
  submitting: boolean;
  templateToEdit?: Template | null;
}

export default function TemplateModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  templateToEdit = null,
}: TemplateModalProps) {
  const [formData, setFormData] = useState<TemplateFormData>({
    title: "",
    slug: "",
    description: "",
    full_description: "",
    category: "",
    cover_image: "",
    preview_images: "",
    features: "",
    delivery_time: "",
    price: 0,
    status: "draft",
  });

  useEffect(() => {
    if (templateToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        id: templateToEdit.id,
        title: templateToEdit.title || "",
        slug: templateToEdit.slug || "",
        description: templateToEdit.description || "",
        full_description: templateToEdit.full_description || "",
        category: templateToEdit.category || "",
        cover_image: templateToEdit.cover_image || "",
        preview_images: templateToEdit.preview_images ? templateToEdit.preview_images.join(", ") : "",
        features: templateToEdit.features || "",
        delivery_time: templateToEdit.delivery_time || "",
        price: templateToEdit.price || 0,
        status: templateToEdit.status || "draft",
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        description: "",
        full_description: "",
        category: "",
        cover_image: "",
        preview_images: "",
        features: "",
        delivery_time: "",
        price: 0,
        status: "draft",
      });
    }
  }, [templateToEdit, isOpen]);

  // Réinitialiser le formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: "",
        slug: "",
        description: "",
        full_description: "",
        category: "",
        cover_image: "",
        preview_images: "",
        features: "",
        delivery_time: "",
        price: 0,
        status: "draft",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      // Réinitialiser après soumission si ce n'est pas une édition
      if (!templateToEdit) {
        setFormData({
          title: "",
          slug: "",
          description: "",
          full_description: "",
          category: "",
          cover_image: "",
          preview_images: "",
          features: "",
          delivery_time: "",
          price: 0,
          status: "draft",
        });
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  // Générer automatiquement le slug à partir du titre
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({ 
      ...formData, 
      title,
      slug: formData.slug || generateSlug(title)
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {templateToEdit ? "Modifier le template" : "Nouveau Template"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-xl transition-colors"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                placeholder="Nom du template"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (URL)
                <span className="text-xs text-gray-400 ml-2">(auto-généré)</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                placeholder="mon-template-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
              placeholder="Ex: Site Web, Blog, E-commerce"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description courte <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none"
              rows={2}
              placeholder="Description rapide du template"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description complète</label>
            <textarea
              value={formData.full_description}
              onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none"
              rows={4}
              placeholder="Description détaillée du template"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Délai de livraison</label>
              <input
                type="text"
                value={formData.delivery_time}
                onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                placeholder="Ex: 24h, 3 jours"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image de couverture</label>
            <input
              type="url"
              value={formData.cover_image}
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images de prévisualisation (séparées par des virgules)
            </label>
            <input
              type="text"
              value={formData.preview_images}
              onChange={(e) => setFormData({ ...formData, preview_images: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
              placeholder="https://example.com/preview1.jpg, https://example.com/preview2.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fonctionnalités</label>
            <textarea
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none"
              rows={3}
              placeholder="- Responsive design&#10;- Optimisé SEO&#10;- Animations CSS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "published" | "draft" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {templateToEdit ? "Modification..." : "Ajout..."}
                </>
              ) : (
                templateToEdit ? "Modifier le template" : "Ajouter le template"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}