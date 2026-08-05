"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutTemplate,
  Eye,
  CheckCircle,
  XCircle,
  Euro,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { Template } from "../types/page";

interface TemplatesTableProps {
  templates: Template[];
  currentPage: number;
  totalTemplates: number;
  templatesPerPage: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onEdit: (template: Template) => void;
  onSearch: (query: string) => void;
  searchQuery?: string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function TemplatesTable({
  templates,
  currentPage,
  totalTemplates,
  templatesPerPage,
  onPageChange,
  onDelete,
  onEdit,
  onSearch,
  searchQuery = "",
  onApprove,
  onReject,
}: TemplatesTableProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const totalPages = Math.ceil(totalTemplates / templatesPerPage);
  const startIndex = (currentPage - 1) * templatesPerPage + 1;
  const endIndex = Math.min(currentPage * templatesPerPage, totalTemplates);

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setLocalSearchQuery("");
    onSearch("");
  };

  const getStatusBadge = (status: string) => {
    if (status === "published" || status === "approved") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-200">
          <CheckCircle size={12} />
          Publié
        </span>
      );
    }
    if (status === "pending") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 ring-1 ring-orange-200">
          <Eye size={12} />
          En attente
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200">
          <XCircle size={12} />
          Refusé
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700 ring-1 ring-yellow-200">
        <XCircle size={12} />
        Brouillon
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return price ? `${price.toFixed(2)} €` : "—";
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Liste des templates</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Rechercher un template..."
              value={localSearchQuery}
              onChange={handleSearchChange}
              className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-shadow"
            />
            {localSearchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Effacer la recherche"
              >
                <XCircle size={14} />
              </button>
            )}
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <SlidersHorizontal size={15} />
            Filtrer
          </button>
        </div>
      </div>

      {searchQuery && (
        <div className="px-5 py-2 text-sm text-slate-500 bg-blue-50/50 border-b border-slate-200">
          <span className="font-medium">{totalTemplates}</span> 
          résultat{totalTemplates > 1 ? 's' : ''} trouvé{totalTemplates > 1 ? 's' : ''} 
          pour &quot;{searchQuery}&quot;
        </div>
      )}

      <div className="overflow-x-auto">
        {templates.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <LayoutTemplate size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-lg font-medium text-slate-700">Aucun template trouvé</p>
            <p className="text-sm">
              {searchQuery 
                ? `Aucun résultat pour "${searchQuery}"` 
                : "Commencez par créer votre premier template"}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Titre</th>
                <th className="px-5 py-3">Catégorie</th>
                <th className="px-5 py-3">Prix</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Délai</th>
                <th className="px-5 py-3">Créé le</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template, index) => (
                <tr key={template.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-slate-500">
                    {(currentPage - 1) * templatesPerPage + index + 1}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {template.cover_image ? (
                        <img
                          src={template.cover_image}
                          alt={template.title}
                          className="h-11 w-11 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-11 w-11 shrink-0 rounded-lg bg-slate-200 flex items-center justify-center">
                          <LayoutTemplate size={20} className="text-slate-400" />
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-slate-900">
                          {template.title || "Sans titre"}
                        </span>
                        {/* Afficher les infos du soumissionnaire si en attente */}
                        {template.status === "pending" && template.submitted_by && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <User size={12} />
                            <span>{template.submitted_by}</span>
                            {template.submitted_email && (
                              <>
                                <Mail size={12} />
                                <span>{template.submitted_email}</span>
                              </>
                            )}
                            {template.submitted_phone && (
                              <>
                                <Phone size={12} />
                                <span>{template.submitted_phone}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-200">
                      {template.category || "Non catégorisé"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                      <Euro size={14} />
                      {formatPrice(template.price)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {getStatusBadge(template.status)}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {template.delivery_time || "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {formatDate(template.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {/* Boutons d'approbation pour les templates en attente */}
                      {template.status === "pending" && onApprove && onReject && (
                        <>
                          <button
                            onClick={() => onApprove(template.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
                            title="Approuver ce template"
                          >
                            <CheckCircle size={13} />
                            Approuver
                          </button>
                          <button
                            onClick={() => onReject(template.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                            title="Refuser ce template"
                          >
                            <XCircle size={13} />
                            Refuser
                          </button>
                        </>
                      )}
                      
                      {/* Boutons d'édition/suppression pour tous */}
                      <button
                        onClick={() => onEdit(template)}
                        className="flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Éditer ce template"
                      >
                        <Pencil size={13} />
                        Éditer
                      </button>
                      <button
                        onClick={() => onDelete(template.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                        title="Supprimer ce template"
                      >
                        <Trash2 size={13} />
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalTemplates > 0 && (
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Affichage de <span className="font-medium">{startIndex}</span> à{' '}
            <span className="font-medium">{endIndex}</span> sur{' '}
            <span className="font-medium">{totalTemplates}</span> templates
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Page précédente"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            ))}
            
            {totalPages > 6 && (
              <>
                <span className="flex h-8 w-8 items-center justify-center text-sm text-slate-400">…</span>
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  aria-label={`Page ${totalPages}`}
                >
                  {totalPages}
                </button>
              </>
            )}
            
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Page suivante"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}