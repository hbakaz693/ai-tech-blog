"use client";

import React, { useState, useRef } from "react";
import { X, Upload, User, Mail, Phone, FileText, Image, Trash2 } from "lucide-react";
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
    features: "",
    delivery_time: "",
    price: 0,
    submitted_by: "",
    submitted_email: "",
    submitted_phone: "",
  });
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [previewImages, setPreviewImages] = useState<File[]>([]);
  const [previewImagesPreviews, setPreviewImagesPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Upload d'une image vers Supabase Storage
  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('templates')
        .upload(filePath, file);

      if (uploadError) {
        console.error("❌ Erreur upload:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('templates')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("❌ Erreur upload image:", error);
      return null;
    }
  };

  // Gestion de l'image de couverture
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gestion des images de prévisualisation
  const handlePreviewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPreviewImages(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImagesPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Supprimer une image de prévisualisation
  const removePreviewImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImagesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Supprimer l'image de couverture
  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview("");
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

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

      if (!coverImage) {
        setErrorMessage("Veuillez sélectionner une image de couverture.");
        setSubmitting(false);
        return;
      }

      // Upload de l'image de couverture
      const coverImageUrl = await uploadImage(coverImage, 'covers');
      if (!coverImageUrl) {
        setErrorMessage("Erreur lors de l'upload de l'image de couverture.");
        setSubmitting(false);
        return;
      }

      // Upload des images de prévisualisation
      const previewImageUrls: string[] = [];
      for (const file of previewImages) {
        const url = await uploadImage(file, 'previews');
        if (url) {
          previewImageUrls.push(url);
        }
      }

      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const newTemplate = {
        title: formData.title.trim(),
        slug: slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: formData.description.trim(),
        full_description: formData.full_description?.trim() || null,
        category: formData.category.trim(),
        cover_image: coverImageUrl,
        preview_images: previewImageUrls.length > 0 ? previewImageUrls : null,
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

      const { data, error } = await supabase
        .from("templates")
        .insert([newTemplate])
        .select();

      if (error) {
        console.error("❌ Erreur Supabase:", error);
        setErrorMessage(`Erreur: ${error.message}`);
        setSubmitting(false);
        return;
      }

      console.log("✅ Template soumis:", data);
      setSuccess(true);
      onSuccess();

      setTimeout(() => {
        setSuccess(false);
        setFormData({
          title: "",
          description: "",
          full_description: "",
          category: "",
          features: "",
          delivery_time: "",
          price: 0,
          submitted_by: "",
          submitted_email: "",
          submitted_phone: "",
        });
        setCoverImage(null);
        setCoverImagePreview("");
        setPreviewImages([]);
        setPreviewImagesPreviews([]);
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

              {/* Upload Image de couverture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture *</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <Image size={20} />
                    Choisir une image
                  </button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                  {coverImage && (
                    <span className="text-sm text-gray-600">{coverImage.name}</span>
                  )}
                </div>
                {coverImagePreview && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="h-32 w-auto rounded-lg object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Images de prévisualisation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images de prévisualisation
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => previewInputRef.current?.click()}
                    className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <Image size={20} />
                    Choisir des images
                  </button>
                  <input
                    ref={previewInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePreviewImagesChange}
                    className="hidden"
                  />
                  {previewImages.length > 0 && (
                    <span className="text-sm text-gray-600">{previewImages.length} image(s)</span>
                  )}
                </div>
                {previewImagesPreviews.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {previewImagesPreviews.map((preview, index) => (
                      <div key={index} className="relative inline-block">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removePreviewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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