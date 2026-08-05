"use client";

import React from "react";
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
} from "lucide-react";

interface NavItemProps {
  label: string;
  icon: React.ElementType;
  active: boolean;
}

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
      <Icon size={18} />
      {label}
    </button>
  );
}

export default function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-[#0B1526] px-4 py-5">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <BookOpen size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold text-white">MyBlog</span>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {/* Dashboard */}
        <div className="flex flex-col gap-1">
          <NavItem label="Dashboard" icon={LayoutDashboard} active={true} />
        </div>

        {/* Contenu */}
        <div className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-slate-500">CONTENU</p>
          <NavItem label="Articles" icon={FileText} active={false} />
        </div>

        
      </nav>

      <button className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white">
        <LogOut size={18} />
        Déconnexion
      </button>
    </aside>
  );
}