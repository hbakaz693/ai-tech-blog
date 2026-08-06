"use client";

import React, { useState } from "react";
import { Eye, Clock, Star, MessageCircle } from "lucide-react";
import { Template } from "../types";
import ReviewsModal from "../ReviewsModal";

interface TemplateCardProps {
  template: Template;
  onViewDetails: (template: Template) => void;
}

export default function TemplateCard({ template, onViewDetails }: TemplateCardProps) {
  const [showReviews, setShowReviews] = useState(false);

  // Calculer la moyenne des étoiles
  const averageRating = template.rating || 0;
  const totalReviews = template.reviews_count || 0;

  return (
    <>
      <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 bg-white group">
        <div className="relative h-48 overflow-hidden">
          {template.cover_image ? (
            <img
              src={template.cover_image}
              alt={template.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{template.title}</span>
            </div>
          )}
          
          {/* Badge statut */}
          <div className="absolute top-2 right-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              template.status === "published" 
                ? "bg-green-500/80 text-white" 
                : "bg-yellow-500/80 text-white"
            }`}>
              {template.status === "published" ? "Disponible" : "Brouillon"}
            </span>
          </div>

          {/* Délai de livraison */}
          {template.delivery_time && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-white/90 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <Clock size={12} />
              {template.delivery_time}
            </div>
          )}

          {/* Prix */}
          <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-lg">
            €{template.price}
          </div>
        </div>
        
        <div className="p-4">
          {/* Catégorie */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              {template.category}
            </span>
          </div>
          
          {/* Titre */}
          <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2">
            {template.title}
          </h3>
          
          {/* Description */}
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {template.description}
          </p>
          
          {/* Rating et Avis */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={`${
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              {averageRating > 0 && (
                <span className="text-sm font-semibold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
              )}
            </div>
            
            <button
              onClick={() => setShowReviews(true)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              <MessageCircle size={12} />
              <span>({totalReviews})</span>
            </button>
          </div>
          
          {/* Fonctionnalités */}
          {template.features && (
            <div className="flex flex-wrap gap-1 mb-3">
              {template.features.split(',').slice(0, 3).map((feature, index) => (
                <span key={index} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  {feature.trim()}
                </span>
              ))}
              {template.features.split(',').length > 3 && (
                <span className="text-[10px] text-gray-400">
                  +{template.features.split(',').length - 3}
                </span>
              )}
            </div>
          )}

          {/* Bouton Voir le template */}
          <button
            onClick={() => onViewDetails(template)}
            className="w-full mt-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2"
          >
            <Eye size={14} />
            Voir le template
          </button>
        </div>
      </div>

      {/* Modal des avis */}
      <ReviewsModal
        isOpen={showReviews}
        onClose={() => setShowReviews(false)}
        templateId={template.id}
        templateTitle={template.title}
      />
    </>
  );
}