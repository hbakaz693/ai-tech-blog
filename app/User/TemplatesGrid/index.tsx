"use client";

import React from "react";
import { Plus } from "lucide-react";
import TemplateCard from "../TemplateCard";
import { Template } from "../types";
interface TemplatesGridProps {
  templates: Template[];
  selectedCategory: string;
  categories: string[];
  onCategorySelect: (category: string) => void;
  onViewDetails: (template: Template) => void;
  showAllTemplates: boolean;
  onToggleShowAll: () => void;
  onAddTemplate: () => void;
}

export default function TemplatesGrid({
  templates,
  selectedCategory,
  categories,
  onCategorySelect,
  onViewDetails,
  showAllTemplates,
  onToggleShowAll,
  onAddTemplate,
}: TemplatesGridProps) {
  // Filtrer uniquement les templates approuvés et publiés
  const approvedTemplates = templates.filter(
    (t) => t.status === "published" || t.status === "approved"
  );

  const filteredTemplates = selectedCategory === "All"
    ? approvedTemplates
    : approvedTemplates.filter((t) => t.category === selectedCategory);

  const displayedTemplates = showAllTemplates
    ? filteredTemplates
    : filteredTemplates.slice(0, 6);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Templates disponibles
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({approvedTemplates.length} disponibles)
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onAddTemplate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Vendre un template
          </button>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  onCategorySelect(category);
                }}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  selectedCategory === category
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {displayedTemplates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">Aucun template disponible</p>
          <p className="text-sm">Proposez votre template en cliquant sur le bouton ci-dessus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}

      {filteredTemplates.length > 6 && (
        <div className="text-center mt-8">
          <button
            onClick={onToggleShowAll}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            {showAllTemplates ? "Voir moins" : `Voir tous (${filteredTemplates.length})`}
          </button>
        </div>
      )}
    </div>
  );
}