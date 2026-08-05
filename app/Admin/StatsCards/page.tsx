"use client";

import React from "react";
import { FileText, FolderOpen } from "lucide-react";

interface StatsCardsProps {
  total: number;
  published: number;
  drafts: number;
  categories: number;
}

export default function StatsCards({ total, published, drafts, categories }: StatsCardsProps) {
  const stats = [
    { label: "Total Articles", value: total, icon: FileText, color: "blue" },
    { label: "Publié(s)", value: published, icon: FileText, color: "emerald" },
    { label: "Brouillon(s)", value: drafts, icon: FileText, color: "amber" },
    { label: "Catégories", value: categories, icon: FolderOpen, color: "purple" },
  ];

  const colors: any = {
    blue: "bg-blue-50 text-blue-500",
    emerald: "bg-emerald-50 text-emerald-500",
    amber: "bg-amber-50 text-amber-500",
    purple: "bg-purple-50 text-purple-500",
  };

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${colors[stat.color]}`}>
            <stat.icon size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}