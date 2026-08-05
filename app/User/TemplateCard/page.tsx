"use client";

import React from "react";
import { Eye, Clock, CheckCircle } from "lucide-react";
import { Template } from "../types/page";

interface TemplateCardProps {
  template: Template;
  onViewDetails: (template: Template) => void;
}

export default function TemplateCard({ template, onViewDetails }: TemplateCardProps) {
  return (
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
        <div className="absolute top-2 right-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/80 text-white">
            {template.status === "published" ? "Disponible" : "Brouillon"}
          </span>
        </div>
        {template.delivery_time && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-white/90 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <Clock size={12} />
            {template.delivery_time}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
            {template.category}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2">
          {template.title}
        </h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{template.description}</p>
        
        {template.features && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.features.split(',').slice(0, 3).map((feature, index) => (
              <span key={index} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {feature.trim()}
              </span>
            ))}
            {template.features.split(',').length > 3 && (
              <span className="text-[10px] text-gray-400">+{template.features.split(',').length - 3}</span>
            )}
          </div>
        )}

        <button
          onClick={() => onViewDetails(template)}
          className="w-full mt-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2"
        >
          <Eye size={14} />
          Voir le template
        </button>
      </div>
    </div>
  );
}