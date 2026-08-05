"use client";

import React, { useState } from "react";
import { X, Upload, User, Mail, Phone, FileText } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
interface SubmitTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitTemplateModal({ isOpen, onClose, onSuccess }: SubmitTemplateModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    full_description: "",
    category: "",
    cover_image: "",
    preview_images: "",
    features: "",
    delivery_time: "",
    price: 0,
    submitted_by: "",
    submitted_email: "",
    submitted_phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Validation
      if (!formData.title || !formData.description || !formData.category || 
          !formData.submitted_by || !formData.submitted_email || !formData.submitted_phone) {
        setErrorMessage("Veuillez remplir tous les champs obligatoires.");
        setSubmitting(false);
        return;
      }

      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const previewImages = formData.preview_images
        ? formData.preview_images.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const newTemplate = {
        title: formData.title.trim(),
        slug: slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: formData.description.trim(),
        full_description: formData.full_description?.trim() || null,
        category: formData.category.trim(),
        cover_image: formData.cover_image?.trim() || null,
        preview_images: previewImages.length > 0 ? previewImages : null,
        features: formData.features?.trim() || null,
        delivery_time: formData.delivery_time?.trim() || null,
        price: Number(formData.price) || 0,
        status: "pending",
        submitted_by: formData.submitted_by.trim(),
        submitted_email: formData.submitted_email.trim(),
        submitted_phone: formData.submitted_phone.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("📝 Envoi du template:", JSON.stringify(newTemplate, null, 2));

      // Vérifier d'abord si la table existe
      const { error: checkError } = await supabase
        .from("templates")
        .select("id")
        .limit(1);

      if (checkError) {
        console.error("❌ Table templates inexistante:", checkError);
        setErrorMessage("La table templates n'existe pas. Contactez l'administrateur.");
        setSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from("templates")
        .insert([newTemplate])
        .select();

      if (error) {
        console.error("❌ Erreur Supabase:", error);
        
        if (error.code === '42P01') {
          setErrorMessage("La table templates n'existe pas. Contactez l'administrateur.");
        } else if (error.code === '42501') {
          setErrorMessage("Erreur de permission. Contactez l'administrateur.");
        } else if (error.code === '23505') {
          setErrorMessage("Un template avec ce titre existe déjà.");
        } else {
          setErrorMessage(`Erreur: ${error.message}`);
        }
        setSubmitting(false);
        return;
      }

      console.log("✅ Template soumis:", data);

      // Créer une notification
      if (data && data[0]) {
        try {
          await supabase
            .from("template_notifications")
            .insert([{
              template_id: data[0].id,
              type: "submission",
              message: `Nouveau template soumis par ${formData.submitted_by}`,
            }]);
        } catch (notifError) {
          console.warn("⚠️ Erreur notification (non bloquante):", notifError);
        }
      }

      setSuccess(true);
      onSuccess();

      setTimeout(() => {
        setSuccess(false);
        setFormData({
          title: "",
          description: "",
          full_description: "",
          category: "",
          cover_image: "",
          preview_images: "",
          features: "",
          delivery_time: "",
          price: 0,
          submitted_by: "",
          submitted_email: "",
          submitted_phone: "",
        });
        onClose();
      }, 3000);
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      setErrorMessage(error?.message || "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Upload size={20} className="text-blue-600" />
            Proposer un template
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            <X size={24} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Template soumis avec succès !</h3>
            <p className="text-gray-600">Votre template a été envoyé pour validation.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                ❌ {errorMessage}
              </div>
            )}

            {/* Vos informations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <User size={16} />
                Vos informations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={formData.submitted_by}
                    onChange={(e) => setFormData({ ...formData, submitted_by: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.submitted_email}
                    onChange={(e) => setFormData({ ...formData, submitted_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.submitted_phone}
                    onChange={(e) => setFormData({ ...formData, submitted_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Informations du template */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText size={16} />
                Informations du template
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du template"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Site Web, Blog"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description courte *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Description rapide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description complète</label>
                <textarea
                  value={formData.full_description}
                  onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Description détaillée"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
                <input
                  type="url"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images (séparées par des virgules)
                </label>
                <input
                  type="text"
                  value={formData.preview_images}
                  onChange={(e) => setFormData({ ...formData, preview_images: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="image1.jpg, image2.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fonctionnalités</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="- Fonctionnalité 1&#10;- Fonctionnalité 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Délai de livraison</label>
                <input
                  type="text"
                  value={formData.delivery_time}
                  onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 24h, 3 jours"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Envoi...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Soumettre
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}