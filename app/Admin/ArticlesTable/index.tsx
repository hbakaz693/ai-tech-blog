"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
} from "lucide-react";
import StatusBadge from "../StatusBadge";
import { Article } from "../types/page";

interface ArticlesTableProps {
  articles: Article[];
  currentPage: number;
  totalArticles: number;
  articlesPerPage: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onEdit: (article: Article) => void;
  onSearch: (query: string) => void;
  searchQuery?: string;
}

const categoryColors: Record<string, string> = {
  "Productivité": "bg-blue-50 text-blue-600 ring-blue-200",
  "Voyage": "bg-purple-50 text-purple-600 ring-purple-200",
  "Développement": "bg-emerald-50 text-emerald-600 ring-emerald-200",
  "Développement personnel": "bg-amber-50 text-amber-600 ring-amber-200",
  "Technologie": "bg-sky-50 text-sky-600 ring-sky-200",
  "Défaut": "bg-gray-50 text-gray-600 ring-gray-200",
};

export default function ArticlesTable({
  articles,
  currentPage,
  totalArticles,
  articlesPerPage,
  onPageChange,
  onDelete,
  onEdit,
  onSearch,
  searchQuery = "",
}: ArticlesTableProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Synchroniser avec la prop searchQuery
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const totalPages = Math.ceil(totalArticles / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage + 1;
  const endIndex = Math.min(currentPage * articlesPerPage, totalArticles);

  const formatDate = (date: string | null) => {
    if (!date) return "—";
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Liste des articles</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Rechercher par titre, catégorie..."
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
                <X size={14} />
              </button>
            )}
          </div>
          <button 
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Filtrer"
          >
            <SlidersHorizontal size={15} />
            Filtrer
          </button>
        </div>
      </div>

      {/* Résultat de la recherche */}
      {searchQuery && (
        <div className="px-5 py-2 text-sm text-slate-500 bg-blue-50/50 border-b border-slate-200">
          <span className="font-medium">{totalArticles}</span> 
          résultat{totalArticles > 1 ? 's' : ''} trouvé{totalArticles > 1 ? 's' : ''} 
          pour &quot;{searchQuery}&quot;
        </div>
      )}

      <div className="overflow-x-auto">
        {articles.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-lg font-medium text-slate-700">Aucun article trouvé</p>
            <p className="text-sm">
              {searchQuery 
                ? `Aucun résultat pour "${searchQuery}"` 
                : "Commencez par créer votre premier article"}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Titre</th>
                <th className="px-5 py-3">Catégorie</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Date de publication</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article, index) => (
                <tr key={article.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-slate-500">
                    {(currentPage - 1) * articlesPerPage + index + 1}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {article.cover_image ? (
                        <img
                          src={article.cover_image}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-11 w-11 shrink-0 rounded-lg bg-slate-200 flex items-center justify-center">
                          <FileText size={20} className="text-slate-400" />
                        </div>
                      )}
                      <span className="font-medium text-slate-900">
                        {article.title}
                        {searchQuery && (
                          <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            match
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                        categoryColors[article.category] || categoryColors["Défaut"]
                      }`}
                    >
                      {article.category || "Non catégorisé"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={article.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {formatDate(article.published_at)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(article)}
                        className="flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                        aria-label={`Éditer ${article.title}`}
                      >
                        <Pencil size={13} />
                        Éditer
                      </button>
                      <button
                        onClick={() => onDelete(article.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                        aria-label={`Supprimer ${article.title}`}
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

      {totalArticles > 0 && (
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Affichage de <span className="font-medium">{startIndex}</span> à{' '}
            <span className="font-medium">{endIndex}</span> sur{' '}
            <span className="font-medium">{totalArticles}</span> articles
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