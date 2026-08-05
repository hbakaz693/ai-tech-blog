"use client";

import React from "react";
import ArticleCard from "../ArticleCard/page";
import { DisplayArticle } from "../types/page";

interface ArticlesGridProps {
  articles: DisplayArticle[];
  selectedTag: string;
  tags: string[];
  onTagSelect: (tag: string) => void;
  onReadMore: (article: DisplayArticle) => void;
  showAllArticles: boolean;
  onToggleShowAll: () => void;
}

export default function ArticlesGrid({
  articles,
  selectedTag,
  tags,
  onTagSelect,
  onReadMore,
  showAllArticles,
  onToggleShowAll,
}: ArticlesGridProps) {
  const filteredArticles = selectedTag === "All"
    ? articles
    : articles.filter((a) => a.tag === selectedTag);

  const displayedArticles = showAllArticles
    ? filteredArticles
    : filteredArticles.slice(0, 6);

  if (displayedArticles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Aucun article publié pour le moment.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Articles</h2>
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                onTagSelect(tag);
              }}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                selectedTag === tag
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onReadMore={onReadMore}
          />
        ))}
      </div>

      {filteredArticles.length > 6 && (
        <div className="text-center mt-8">
          <button
            onClick={onToggleShowAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAllArticles ? "Show Less" : `View All ${filteredArticles.length} Articles`}
          </button>
        </div>
      )}
    </div>
  );
}