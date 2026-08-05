"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Header from "./User/Header/page";
import HeroSection from "./User/HeroSection/page";
import ArticlesGrid from "./User/ArticlesGrid/page";
import ArticleModal from "./User/ArticleModal/page";
import TemplatesGrid from "./User/TemplatesGrid/page";
import TemplateModal from "./User/TemplateModal/page";
import SubmitTemplateModal from "./User/SubmitTemplateModal/page";
import Footer from "./User/Footer/page";
import { DisplayArticle, Template } from "./User/types/page";

export default function HomePage() {
  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<DisplayArticle | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState<"home" | "shop">("home");
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchArticles();
    // eslint-disable-next-line react-hooks/immutability
    fetchTemplates();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from("articles")
        .select("*")
        .not('published_at', 'is', null)
        .order("published_at", { ascending: false });

      if (supabaseError) throw supabaseError;

      const formattedArticles: DisplayArticle[] = data.map((article: any) => ({
        id: article.id,
        tag: article.category,
        date: new Date(article.published_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        cover_image: article.cover_image,
        status: "Publié",
      }));

      setArticles(formattedArticles);
    } catch (err) {
      console.error("Error fetching articles:", err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from("templates")
        .select("*")
        .in('status', ['published', 'approved'])
        .order("created_at", { ascending: false });

      if (supabaseError) throw supabaseError;

      setTemplates(data || []);
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const articleTags = ["All", ...new Set(articles.map((a) => a.tag))];
  const templateCategories = ["All", ...new Set(templates.map((t) => t.category))];

  const handleTemplateSubmitted = () => {
    fetchTemplates();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto bg-white min-h-screen rounded-lg shadow-lg">
        <Header currentPage={currentPage} onPageChange={setCurrentPage} />

        {currentPage === "home" ? (
          <>
            <HeroSection
              showAllArticles={showAllArticles}
              onToggleShowAll={() => setShowAllArticles(!showAllArticles)}
            />

            <section className="px-8 py-10" id="articles">
              <ArticlesGrid
                articles={articles}
                selectedTag={selectedTag}
                tags={articleTags}
                onTagSelect={(tag) => {
                  setSelectedTag(tag);
                  setShowAllArticles(false);
                }}
                onReadMore={setSelectedArticle}
                showAllArticles={showAllArticles}
                onToggleShowAll={() => setShowAllArticles(!showAllArticles)}
              />
            </section>
          </>
        ) : (
          <section className="px-8 py-10">
            <TemplatesGrid
              templates={templates}
              selectedCategory={selectedCategory}
              categories={templateCategories}
              onCategorySelect={(category) => {
                setSelectedCategory(category);
                setShowAllTemplates(false);
              }}
              onViewDetails={setSelectedTemplate}
              showAllTemplates={showAllTemplates}
              onToggleShowAll={() => setShowAllTemplates(!showAllTemplates)}
              onAddTemplate={() => setShowSubmitModal(true)}
            />
          </section>
        )}

        <Footer />
      </div>

      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <TemplateModal
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
      />

      <SubmitTemplateModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSuccess={handleTemplateSubmitted}
      />

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}