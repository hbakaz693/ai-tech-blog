"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { supabase } from "../lib/supabase";
import Sidebar from "./Sidebar/page";
import Topbar from "./Topbar/page";
import StatsCards from "./StatsCards/page";
import ArticlesTable from "./ArticlesTable/page";
import ArticleModal from "./ArticleModal/page";
import { Article,FormData } from "./types/page";

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);
  const articlesPerPage = 5;

  // Fonction fetch avec debounce
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      
      // Construire la requête de base
      let query = supabase
        .from("articles")
        .select("*", { count: "exact" });

      // Appliquer la recherche si elle existe
      if (searchQuery.trim()) {
        query = query.or(
          `title.ilike.%${searchQuery}%,` +
          `category.ilike.%${searchQuery}%,` +
          `excerpt.ilike.%${searchQuery}%,` +
          `content.ilike.%${searchQuery}%`
        );
      }

      // Récupérer le nombre total d'articles
      const { count, error: countError } = await query;
      
      if (countError) throw countError;

      // Récupérer les articles paginés
      const { data, error } = await query
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage - 1);

      if (error) throw error;

      const formattedArticles: Article[] = data.map((article: any) => ({
        ...article,
        status: article.published_at ? "Publié" : "Brouillon",
      }));

      setArticles(formattedArticles);
      setTotalArticles(count || 0);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, articlesPerPage]);

  // Effet pour charger les articles avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchArticles]);

  // Ajouter un article
  const handleAddArticle = async (formData: FormData) => {
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // Vérifier que les champs obligatoires sont remplis
      if (!formData.title || !formData.category || !formData.content) {
        alert("Veuillez remplir tous les champs obligatoires (Titre, Catégorie, Contenu)");
        setSubmitting(false);
        return;
      }

      const newArticle = {
        title: formData.title.trim(),
        slug: slug,
        category: formData.category.trim(),
        excerpt: formData.excerpt?.trim() || "",
        content: formData.content.trim(),
        cover_image: formData.cover_image?.trim() || null,
        published_at: formData.status === "Publié" ? now : null,
        created_at: now,
        updated_at: now,
        reading_time: Math.ceil(formData.content.split(" ").length / 200),
      };

      console.log("📝 Article à insérer:", JSON.stringify(newArticle, null, 2));

      const { data, error } = await supabase
        .from("articles")
        .insert([newArticle])
        .select();

      if (error) {
        console.error("❌ Erreur Supabase:", error);
        
        if (error.code === '42501') {
          alert("Erreur de permission. Vérifiez les politiques RLS.");
        } else {
          alert(`Erreur: ${error.message}`);
        }
        throw error;
      }

      console.log("✅ Article ajouté:", data);

      setShowModal(false);
      setArticleToEdit(null);
      setCurrentPage(1);
      await fetchArticles();
      alert("Article ajouté avec succès !");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error adding article:", error);
      let errorMessage = "Erreur lors de l'ajout de l'article";
      if (error?.message) errorMessage += `: ${error.message}`;
      if (error?.details) errorMessage += `\nDétails: ${error.details}`;
      if (error?.code) errorMessage += `\nCode: ${error.code}`;
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Modifier un article
  const handleEditArticle = async (formData: FormData) => {
    if (!formData.id) {
      alert("ID de l'article manquant");
      return;
    }
    
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const updatedArticle = {
        title: formData.title.trim(),
        slug: slug,
        category: formData.category.trim(),
        excerpt: formData.excerpt?.trim() || "",
        content: formData.content.trim(),
        cover_image: formData.cover_image?.trim() || null,
        published_at: formData.status === "Publié" ? now : null,
        updated_at: now,
        reading_time: Math.ceil(formData.content.split(" ").length / 200),
      };

      console.log("📝 Article à modifier:", JSON.stringify(updatedArticle, null, 2));

      const { data, error } = await supabase
        .from("articles")
        .update(updatedArticle)
        .eq("id", formData.id)
        .select();

      if (error) {
        console.error("❌ Erreur Supabase:", error);
        alert(`Erreur: ${error.message}`);
        throw error;
      }

      console.log("✅ Article modifié:", data);

      setShowModal(false);
      setArticleToEdit(null);
      await fetchArticles();
      alert("Article modifié avec succès !");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error updating article:", error);
      let errorMessage = "Erreur lors de la modification de l'article";
      if (error?.message) errorMessage += `: ${error.message}`;
      if (error?.details) errorMessage += `\nDétails: ${error.details}`;
      if (error?.code) errorMessage += `\nCode: ${error.code}`;
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer un article
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;
    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("❌ Erreur Supabase:", error);
        alert(`Erreur: ${error.message}`);
        throw error;
      }

      await fetchArticles();
      alert("Article supprimé avec succès !");
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // Ouvrir le modal d'édition
  const openEditModal = (article: Article) => {
    setArticleToEdit(article);
    setShowModal(true);
  };

  // Ouvrir le modal d'ajout
  const openAddModal = () => {
    setArticleToEdit(null);
    setShowModal(true);
  };

  // Soumettre le formulaire (ajout ou édition)
  const handleModalSubmit = async (formData: FormData) => {
    if (formData.id) {
      await handleEditArticle(formData);
    } else {
      await handleAddArticle(formData);
    }
  };

  // Gestionnaire de recherche
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Calcul des statistiques
  const published = articles.filter((a) => a.status === "Publié").length;
  const drafts = articles.filter((a) => a.status === "Brouillon").length;
  const categories = [...new Set(articles.map((a) => a.category).filter(Boolean))].length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 px-8 py-6">
          {/* En-tête */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Articles</h1>
              <p className="mt-1 text-sm text-slate-500">
                Gérez tous les articles de votre blog.
                {searchQuery && (
                  <span className="ml-2 text-blue-600">
                    Résultats pour &quot;{searchQuery}&quot;
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/20 hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              New Article
            </button>
          </div>

          {/* Cartes de statistiques */}
          <StatsCards 
            total={totalArticles} 
            published={published} 
            drafts={drafts} 
            categories={categories} 
          />

          {/* Tableau des articles */}
          <ArticlesTable
            articles={articles}
            currentPage={currentPage}
            totalArticles={totalArticles}
            articlesPerPage={articlesPerPage}
            onPageChange={setCurrentPage}
            onDelete={handleDelete}
            onEdit={openEditModal}
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />
        </main>
      </div>

      {/* Modal d'ajout/édition */}
      <ArticleModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setArticleToEdit(null);
        }}
        onSubmit={handleModalSubmit}
        submitting={submitting}
        articleToEdit={articleToEdit}
      />
    </div>
  );
}