"use client";

import React from "react";
import { X, Clock, CheckCircle, ShoppingCart, Euro } from "lucide-react";
import { Template } from "../types";

interface TemplateModalProps {
  template: Template | null;
  onClose: () => void;
}

export default function TemplateModal({ template, onClose }: TemplateModalProps) {
  if (!template) return null;

  const features = template.features ? template.features.split(',').map(f => f.trim()) : [];

  // Fonction pour ouvrir WhatsApp
  const openWhatsApp = () => {
    const phoneNumber = "+212 638620619"; // Numéro de téléphone
    const message = `Bonjour, je souhaite commander le template "${template.title}" au prix de ${template.price.toFixed(2)} €.`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded">
              {template.category}
            </span>
            {template.delivery_time && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} />
                {template.delivery_time}
              </span>
            )}
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
              Disponible
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
              <Euro size={12} />
              {template.price.toFixed(2)} €
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne de gauche - Détails du template */}
            <div>
              {template.cover_image && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img
                    src={template.cover_image}
                    alt={template.title}
                    className="w-full h-56 object-cover"
                  />
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900 mb-2">{template.title}</h2>
              <p className="text-gray-600 mb-4">{template.description}</p>

              {template.full_description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description complète</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{template.full_description}</p>
                </div>
              )}

              {template.preview_images && template.preview_images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Aperçus</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {template.preview_images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-28 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Fonctionnalités</h3>
                  <ul className="grid grid-cols-1 gap-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Colonne de droite - Bouton de commande */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200 flex flex-col items-center justify-center">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
                  <ShoppingCart size={40} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Prêt à commander ?</h3>
                <p className="text-sm text-gray-600 mt-2">
                  🛠️ Besoin d&apos;adapter ce template à votre profil ?
Contactez le créateur pour demander une personnalisation.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 w-full border border-gray-200 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Template</span>
                  <span className="text-sm font-medium text-gray-900">{template.title}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Prix</span>
                  <span className="text-lg font-bold text-blue-600">{template.price.toFixed(2)} €</span>
                </div>
                {template.delivery_time && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Délai de livraison</span>
                    <span className="text-sm font-medium text-gray-900">{template.delivery_time}</span>
                  </div>
                )}
              </div>

              <button
                onClick={openWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 text-sm shadow-lg hover:shadow-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              Demander une personnalisation
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                💳 Paiement sécurisé via recharge. Notre équipe vous contactera pour finaliser la commande.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}