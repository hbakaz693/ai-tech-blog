"use client";

import React, { useState, useEffect } from "react";
import { FormData,Status,Article } from "../types";

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  submitting: boolean;
  articleToEdit?: Article | null;
}

export default function ArticleModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  submitting,
  articleToEdit = null 
}: ArticleModalProps) {
  const [formData, setFormData] = useState<FormData>({
    id: undefined,
    title: "",
    slug: "",
    category: "",
    status: "Brouillon",
    content: "",
    excerpt: "",
    cover_image: "",
  });

  // Remplir le formulaire si on édite un article
  useEffect(() => {
    if (articleToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        id: articleToEdit.id,
        title: articleToEdit.title || "",
        slug: articleToEdit.slug || "",
        category: articleToEdit.category || "",
        status: articleToEdit.status || "Brouillon",
        content: articleToEdit.content || "",
        excerpt: articleToEdit.excerpt || "",
        cover_image: articleToEdit.cover_image || "",
      });
    } else {
      setFormData({
        id: undefined,
        title: "",
        slug: "",
        category: "",
        status: "Brouillon",
        content: "",
        excerpt: "",
        cover_image: "",
      });
    }
  }, [articleToEdit, isOpen]);

  // Reset du formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        id: undefined,
        title: "",
        slug: "",
        category: "",
        status: "Brouillon",
        content: "",
        excerpt: "",
        cover_image: "",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      // Reset form après soumission seulement si ce n'est pas une édition
      if (!articleToEdit) {
        setFormData({
          id: undefined,
          title: "",
          slug: "",
          category: "",
          status: "Brouillon",
          content: "",
          excerpt: "",
          cover_image: "",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    }
  };

  // Générer automatiquement le slug à partir du titre
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Mettre à jour le slug automatiquement si vide
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
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {articleToEdit ? "Modifier l'article" : "Nouvel Article"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-xl transition-colors"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              placeholder="Titre de l'article"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL)
              <span className="text-xs text-gray-400 ml-2">(laissé vide pour auto-génération)</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
              placeholder="mon-article-slug"
            />
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
              placeholder="Ex: Technologie, Productivité"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Extrait</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none"
              rows={2}
              placeholder="Résumé de l'article"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none"
              rows={6}
              placeholder="Contenu de l'article..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image de couverture</label>
            <input
              type="url"
              value={formData.cover_image}
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
            >
              <option value="Brouillon">Brouillon</option>
              <option value="Publié">Publié</option>
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
                  {articleToEdit ? "Modification..." : "Ajout..."}
                </>
              ) : (
                articleToEdit ? "Modifier l'article" : "Ajouter l'article"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}