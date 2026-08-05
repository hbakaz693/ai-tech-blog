"use client";

import React from "react";

interface HeroSectionProps {
  showAllArticles: boolean;
  onToggleShowAll: () => void;
}

export default function HeroSection({ showAllArticles, onToggleShowAll }: HeroSectionProps) {
  const scrollToArticles = () => {
    const element = document.getElementById("articles");
    if (element) element.scrollIntoView({ behavior: "smooth" });
    onToggleShowAll();
  };

  return (
    <section className="px-8 py-14 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">
          Discover & Build<br />With Modern<br />Templates
        </h1>
        <p className="mt-4 text-sm text-gray-600 leading-relaxed">
        Explore a collection of modern, ready-to-use templates for websites, dashboards, portfolios, and digital products. A space for developers and creators to find useful resources, get inspired, and build better projects faster.
        </p>
        <button
          onClick={scrollToArticles}
          className="mt-6 bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAllArticles ? "Show Less" : "Explore Articles"}
        </button>
      </div>
    </section>
  );
}