"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Bell } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import Sidebar from "../Sidebar/page";
import Topbar from "../Topbar/page";
import TemplatesTable from "../TemplatesTable/page";
import TemplateModal from "../TemplateModal/page";
import { Template,TemplateFormData } from "../types";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const templatesPerPage = 5;

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("templates")
        .select("*", { count: "exact" });

      if (searchQuery.trim()) {
        query = query.or(
          `title.ilike.%${searchQuery}%,` +
          `category.ilike.%${searchQuery}%,` +
          `description.ilike.%${searchQuery}%`
        );
      }

      const { count, error: countError } = await query;
      if (countError) throw countError;

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * templatesPerPage, currentPage * templatesPerPage - 1);

      if (error) throw error;

      setTemplates(data || []);
      setTotalTemplates(count || 0);

      // Compter les templates en attente
      const { count: pending } = await supabase
        .from("templates")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      setPendingCount(pending || 0);

      // Récupérer les notifications
      const { data: notifData } = await supabase
        .from("template_notifications")
        .select("*")
        .eq("read", false)
        .order("created_at", { ascending: false });

      setNotifications(notifData || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, templatesPerPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTemplates();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTemplates]);

  // Approuver un template
  const handleApproveTemplate = async (id: string) => {
    if (!confirm("Approuver ce template ? Il sera visible par les utilisateurs.")) return;
    
    try {
      const { error } = await supabase
        .from("templates")
        .update({ 
          status: "published",
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      // Créer une notification d'approbation
      await supabase
        .from("template_notifications")
        .insert([{
          template_id: id,
          type: "approval",
          message: "Template approuvé et publié avec succès",
        }]);

      await fetchTemplates();
      alert("✅ Template approuvé avec succès !");
    } catch (error) {
      console.error("Error approving template:", error);
      alert("❌ Erreur lors de l'approbation");
    }
  };

  // Refuser un template
  const handleRejectTemplate = async (id: string) => {
    const reason = prompt("Raison du refus (optionnel) :");
    if (reason === null) return;
    
    if (!confirm("Refuser ce template ?")) return;

    try {
      const { error } = await supabase
        .from("templates")
        .update({ 
          status: "rejected",
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      // Créer une notification de refus
      await supabase
        .from("template_notifications")
        .insert([{
          template_id: id,
          type: "rejection",
          message: reason ? `Template refusé : ${reason}` : "Template refusé",
        }]);

      await fetchTemplates();
      alert("❌ Template refusé.");
    } catch (error) {
      console.error("Error rejecting template:", error);
      alert("❌ Erreur lors du refus");
    }
  };

  // Marquer une notification comme lue
  const markNotificationAsRead = async (id: string) => {
    try {
      await supabase
        .from("template_notifications")
        .update({ read: true })
        .eq("id", id);

      setNotifications(notifications.filter(n => n.id !== id));
      setPendingCount(Math.max(0, pendingCount - 1));
    } catch (error) {
      console.error("Error marking notification:", error);
    }
  };

  // Ajouter un template (admin)
  const handleAddTemplate = async (formData: TemplateFormData) => {
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const previewImages = formData.preview_images
        ? formData.preview_images.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const newTemplate = {
        title: formData.title.trim(),
        slug: slug,
        description: formData.description.trim(),
        full_description: formData.full_description?.trim() || null,
        category: formData.category.trim(),
        cover_image: formData.cover_image?.trim() || null,
        preview_images: previewImages.length > 0 ? previewImages : null,
        features: formData.features?.trim() || null,
        delivery_time: formData.delivery_time?.trim() || null,
        price: Number(formData.price) || 0,
        status: "published", // L'admin ajoute directement publié
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from("templates")
        .insert([newTemplate])
        .select();

      if (error) throw error;

      setShowModal(false);
      setTemplateToEdit(null);
      setCurrentPage(1);
      await fetchTemplates();
      alert("✅ Template ajouté avec succès !");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error adding template:", error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Modifier un template
  const handleEditTemplate = async (formData: TemplateFormData) => {
    if (!formData.id) {
      alert("ID du template manquant");
      return;
    }
    
    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const previewImages = formData.preview_images
        ? formData.preview_images.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const updatedTemplate = {
        title: formData.title.trim(),
        slug: slug,
        description: formData.description.trim(),
        full_description: formData.full_description?.trim() || null,
        category: formData.category.trim(),
        cover_image: formData.cover_image?.trim() || null,
        preview_images: previewImages.length > 0 ? previewImages : null,
        features: formData.features?.trim() || null,
        delivery_time: formData.delivery_time?.trim() || null,
        price: Number(formData.price) || 0,
        status: formData.status || "draft",
        updated_at: now,
      };

      const { data, error } = await supabase
        .from("templates")
        .update(updatedTemplate)
        .eq("id", formData.id)
        .select();

      if (error) throw error;

      setShowModal(false);
      setTemplateToEdit(null);
      await fetchTemplates();
      alert("✅ Template modifié avec succès !");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error updating template:", error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer un template
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce template ?")) return;
    try {
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchTemplates();
      alert("✅ Template supprimé avec succès !");
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("❌ Erreur lors de la suppression");
    }
  };

  // Ouvrir le modal d'édition
  const openEditModal = (template: Template) => {
    setTemplateToEdit(template);
    setShowModal(true);
  };

  // Ouvrir le modal d'ajout
  const openAddModal = () => {
    setTemplateToEdit(null);
    setShowModal(true);
  };

  // Soumettre le formulaire
  const handleModalSubmit = async (formData: TemplateFormData) => {
    if (formData.id) {
      await handleEditTemplate(formData);
    } else {
      await handleAddTemplate(formData);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
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
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 px-8 py-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                Templates
                {pendingCount > 0 && (
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                    <Bell size={16} />
                    {pendingCount} en attente
                  </span>
                )}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Gérez vos templates à vendre.
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
              New Template
            </button>
          </div>

          {/* Liste des notifications */}
          {notifications.length > 0 && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Bell size={16} />
                Notifications ({notifications.length})
              </h3>
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm">
                    <span className="text-gray-700">{notif.message}</span>
                    <button
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Marquer comme lu
                    </button>
                  </div>
                ))}
                {notifications.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    + {notifications.length - 5} autres notifications
                  </p>
                )}
              </div>
            </div>
          )}

          <TemplatesTable
            templates={templates}
            currentPage={currentPage}
            totalTemplates={totalTemplates}
            templatesPerPage={templatesPerPage}
            onPageChange={setCurrentPage}
            onDelete={handleDelete}
            onEdit={openEditModal}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            onApprove={handleApproveTemplate}
            onReject={handleRejectTemplate}
          />
        </main>
      </div>

      <TemplateModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setTemplateToEdit(null);
        }}
        onSubmit={handleModalSubmit}
        submitting={submitting}
        templateToEdit={templateToEdit}
      />
    </div>
  );
}