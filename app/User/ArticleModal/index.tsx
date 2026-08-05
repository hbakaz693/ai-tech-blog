"use client";

import React from "react";
import { DisplayArticle } from "../types";

interface ArticleModalProps {
  article: DisplayArticle | null;
  onClose: () => void;
}

export default function ArticleModal({ article, onClose }: ArticleModalProps) {
  if (!article) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
              {article.tag}
            </span>
            <span className="text-xs text-gray-400 ml-2">{article.date}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h2>
          <div className="prose prose-sm max-w-none">
            <div className="text-gray-600 leading-relaxed whitespace-pre-line">
              {article.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}