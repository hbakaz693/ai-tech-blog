"use client";

import React from "react";
import { DisplayArticle } from "../types";

interface ArticleCardProps {
  article: DisplayArticle;
  onReadMore: (article: DisplayArticle) => void;
}

export default function ArticleCard({ article, onReadMore }: ArticleCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
      <div
        className="h-32 bg-gradient-to-br from-gray-700 to-gray-900 relative"
        style={{
          backgroundImage: article.cover_image ? `url(${article.cover_image})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!article.cover_image && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"></div>
        )}
        <span className="absolute top-2 left-2 text-[10px] text-white/90 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
          {article.tag}
        </span>
        <div className="absolute bottom-2 right-2 text-[10px] text-white/60">
          {article.date}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{article.excerpt}</p>
        <button
          onClick={() => onReadMore(article)}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
        >
          Read More
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
}