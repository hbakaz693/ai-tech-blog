"use client";

import React, { useState, useEffect, JSX } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category: string;
  reading_time: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

interface DisplayArticle {
  id: string;
  tag: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
}

export default function Home(): JSX.Element {
  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<DisplayArticle | null>(null);
  const [showAllArticles, setShowAllArticles] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [showAds, setShowAds] = useState<boolean>(false);

  useEffect(() => {
    const fetchArticles = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from("articles")
          .select("*")
          .order("published_at", { ascending: false });

        if (supabaseError) throw supabaseError;

        const formattedArticles: DisplayArticle[] = data.map((article: Article) => ({
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
        }));

        setArticles(formattedArticles);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError("Failed to load articles. Please try again later.");
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Charger le script d'ads uniquement quand showAds est true
  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    if (showAds) {
      script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://pl30529608.effectivecpmnetwork.com/eeb3a931b309a02ce3e3992a8ab39ca4/invoke.js';
      document.body.appendChild(script);
    }

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [showAds]);

  const tags = ["All", ...new Set(articles.map((a) => a.tag))];
  const filteredArticles = selectedTag === "All" ? articles : articles.filter((a) => a.tag === selectedTag);
  const displayedArticles = showAllArticles ? filteredArticles : filteredArticles.slice(0, 3);

  const handleReadMore = (article: DisplayArticle): void => {
    setSelectedArticle(article);
    setShowAds(true);
  };

  const closeArticleModal = (): void => {
    setSelectedArticle(null);
    setShowAds(false);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        closeArticleModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedArticle ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedArticle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading articles...</p>
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
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4">
      <div className="w-full max-w-7xl mx-auto bg-white min-h-screen">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">IT</div>
            <span className="font-semibold text-gray-900">IA&Tech</span>
          </div>
          <nav className="flex items-center gap-8">
            <span className="text-blue-600 font-medium text-sm border-b-2 border-blue-600 pb-1">Home</span>
            <span className="text-gray-500 text-sm hover:text-gray-700 cursor-pointer">Articles</span>
          </nav>
        </header>

        <section className="px-8 py-14 bg-gradient-to-br from-gray-50 to-blue-50/30">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Sharing Knowledge<br />About AI, Software<br />Engineering & Career
            </h1>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              Introducing knowledge about AI, software engineering & career. A space for tutorials, notes, and lessons learned building modern products.
            </p>
            <button
              onClick={() => {
                const element = document.getElementById("articles");
                if (element) element.scrollIntoView({ behavior: "smooth" });
                setShowAllArticles(!showAllArticles);
              }}
              className="mt-6 bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              {showAllArticles ? "Show Less" : "Explore Articles"}
            </button>
          </div>
        </section>

        <section className="px-8 py-10" id="articles">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Articles</h2>
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setSelectedTag(tag); setShowAllArticles(false); }}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    selectedTag === tag ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {displayedArticles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No articles found for this tag.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayedArticles.map((article) => (
                <div key={article.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                  <div 
                    className="h-32 bg-gradient-to-br from-gray-700 to-gray-900 relative"
                    style={{
                      backgroundImage: article.cover_image ? `url(${article.cover_image})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!article.cover_image && <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"></div>}
                    <span className="absolute top-2 left-2 text-[10px] text-white/90 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
                      {article.tag}
                    </span>
                    <div className="absolute bottom-2 right-2 text-[10px] text-white/60">{article.date}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2">{article.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{article.excerpt}</p>
                    <button
                      onClick={() => handleReadMore(article)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                    >
                      Read More <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredArticles.length > 3 && (
            <div className="text-center mt-8">
              <button onClick={() => setShowAllArticles(!showAllArticles)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                {showAllArticles ? "Show Less" : `View All ${filteredArticles.length} Articles`}
              </button>
            </div>
          )}
        </section>

        {/* Zone publicitaire - visible uniquement quand showAds est true */}
        {showAds && (
          <div className="px-8 py-6 bg-gray-50 border-y border-gray-200">
            <div id="container-eeb3a931b309a02ce3e3992a8ab39ca4"></div>
          </div>
        )}

        <footer className="flex items-center justify-between px-8 py-4 border-t border-gray-200 text-xs text-gray-400">
          <span>Copyright © Hicham Bakaz & Tech blog</span>
          <div className="flex gap-4">
            <span className="hover:text-gray-600 cursor-pointer">GitHub</span>
            <span className="hover:text-gray-600 cursor-pointer">LinkedIn</span>
            <span className="hover:text-gray-600 cursor-pointer">Twitter</span>
          </div>
        </footer>
      </div>

      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={closeArticleModal}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">{selectedArticle.tag}</span>
                <span className="text-xs text-gray-400 ml-2">{selectedArticle.date}</span>
              </div>
              <button onClick={closeArticleModal} className="text-gray-400 hover:text-gray-600 text-xl transition-colors">✕</button>
            </div>
            
            <div className="px-6 py-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h2>
              <div className="prose prose-sm max-w-none">
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">{selectedArticle.content}</div>
              </div>
            </div>

            {/* Publicités dans le modal */}
            {showAds && (
              <div className="px-6 pb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-400 text-center mb-2">Sponsored Content</p>
                  <div id="container-modal-eeb3a931b309a02ce3e3992a8ab39ca4"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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