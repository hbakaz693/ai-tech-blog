"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  LayoutDashboard,
  FileText,
  FolderOpen,
  MessageSquare,
  Tag,
  Image as ImageIcon,
  Users,
  Shield,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Plus,
  Search,
  SlidersHorizontal,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Status = "Publié" | "Brouillon";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: Status;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  reading_time: number;
}

interface NavItemProps {
  label: string;
  icon: React.ElementType;
  active: boolean;
}

const navPrimary = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
];

const navContent = [
  { label: "Articles", icon: FileText, active: true },
  { label: "Catégories", icon: FolderOpen, active: false },
  { label: "Commentaires", icon: MessageSquare, active: false },
  { label: "Tags", icon: Tag, active: false },
  { label: "Médias", icon: ImageIcon, active: false },
];

const navUsers = [
  { label: "Utilisateurs", icon: Users, active: false },
  { label: "Rôles", icon: Shield, active: false },
];

const navSettings = [{ label: "Paramètres", icon: Settings, active: false }];

const categoryColors: Record<string, string> = {
  "Productivité": "bg-blue-50 text-blue-600 ring-blue-200",
  "Voyage": "bg-purple-50 text-purple-600 ring-purple-200",
  "Développement": "bg-emerald-50 text-emerald-600 ring-emerald-200",
  "Développement personnel": "bg-amber-50 text-amber-600 ring-amber-200",
  "Technologie": "bg-sky-50 text-sky-600 ring-sky-200",
};

function NavItem({ label, icon: Icon, active }: NavItemProps) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white shadow-sm shadow-blue-900/30"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className="h-4.5 w-4.5" size={18} />
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const isPublished = status === "Publié";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        isPublished
          ? "bg-emerald-50 text-emerald-600 ring-emerald-200"
          : "bg-amber-50 text-amber-600 ring-amber-200"
      }`}
    >
      {status}
    </span>
  );
}

export default function ArticlesDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const articlesPerPage = 5;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    status: "Brouillon" as Status,
    content: "",
    excerpt: "",
    cover_image: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchArticles();
  }, [currentPage, searchQuery]);

  const fetchArticles = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("articles")
        .select("*", { count: "exact" });

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      const { count } = await query;

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage - 1);

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const now = new Date().toISOString();
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const newArticle = {
        title: formData.title,
        slug: slug,
        category: formData.category,
        excerpt: formData.excerpt || "",
        content: formData.content,
        cover_image: formData.cover_image || null,
        published_at: formData.status === "Publié" ? now : null,
        created_at: now,
        updated_at: now,
        reading_time: Math.ceil(formData.content.split(' ').length / 200),
      };

      console.log("Article à insérer:", newArticle);

      const { data, error } = await supabase
        .from("articles")
        .insert([newArticle])
        .select();

      if (error) {
        console.error("Erreur Supabase détaillée:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log("Article ajouté avec succès:", data);

      // Reset form and refresh
      setFormData({
        title: "",
        slug: "",
        category: "",
        status: "Brouillon",
        content: "",
        excerpt: "",
        cover_image: "",
      });
      setShowModal(false);
      await fetchArticles();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error adding article:", error);
      
      // Afficher un message plus détaillé
      let errorMessage = "Erreur lors de l'ajout de l'article";
      if (error?.message) {
        errorMessage += `: ${error.message}`;
      }
      if (error?.details) {
        errorMessage += `\nDétails: ${error.details}`;
      }
      if (error?.code) {
        errorMessage += `\nCode: ${error.code}`;
      }
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const stats = [
    {
      label: "Total Articles",
      value: totalArticles,
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Publié(s)",
      value: articles.filter(a => a.status === "Publié").length,
      icon: FileText,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      label: "Brouillon(s)",
      value: articles.filter(a => a.status === "Brouillon").length,
      icon: FileText,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      label: "Catégories",
      value: [...new Set(articles.map(a => a.category))].length,
      icon: FolderOpen,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
  ];

  const totalPages = Math.ceil(totalArticles / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage + 1;
  const endIndex = Math.min(currentPage * articlesPerPage, totalArticles);

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col bg-[#0B1526] px-4 py-5">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <BookOpen size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">MyBlog</span>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {navPrimary.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-slate-500">
              CONTENU
            </p>
            {navContent.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-slate-500">
              UTILISATEURS
            </p>
            {navUsers.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-slate-500">
              PARAMÈTRES
            </p>
            {navSettings.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </div>
        </nav>

        <button
          type="button"
          className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Topbar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
          <button
            type="button"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Ouvrir le menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="flex items-center gap-5">
            <button
              type="button"
              className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                3
              </span>
            </button>
            <button type="button" className="flex items-center gap-2">
              <img
                src="https://i.pravatar.cc/64?img=12"
                alt="Avatar admin"
                className="h-9 w-9 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-slate-700">Admin</span>
              <ChevronDown size={16} className="text-slate-400" />
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 px-8 py-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Articles</h1>
              <p className="mt-1 text-sm text-slate-500">
                Gérez tous les articles de votre blog.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/20 hover:bg-blue-700"
            >
              <Plus size={16} />
              New Article
            </button>
          </div>

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${stat.iconBg}`}
                >
                  <stat.icon size={20} className={stat.iconColor} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Liste des articles
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Rechercher un article..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <SlidersHorizontal size={15} />
                  Filtrer
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
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
                    <tr
                      key={article.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
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
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                            categoryColors[article.category] || "bg-gray-50 text-gray-600 ring-gray-200"
                          }`}
                        >
                          {article.category}
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
                            type="button"
                            className="flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={13} />
                            Éditer
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(article.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
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
            </div>

            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Affichage de {startIndex} à {endIndex} sur {totalArticles} articles
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {totalPages > 6 && (
                  <span className="flex h-8 w-8 items-center justify-center text-sm text-slate-400">
                    …
                  </span>
                )}
                {totalPages > 6 && (
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {totalPages}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal d'ajout d'article */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Nouvel Article</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddArticle} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Titre de l'article"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="mon-article-slug (laissé vide pour auto-génération)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Technologie, Productivité"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extrait
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Résumé de l'article"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  placeholder="Contenu de l'article..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'image de couverture
                </label>
                <input
                  type="url"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({...formData, cover_image: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as Status})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Brouillon">Brouillon</option>
                  <option value="Publié">Publié</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Ajout...
                    </>
                  ) : (
                    "Ajouter l'article"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}