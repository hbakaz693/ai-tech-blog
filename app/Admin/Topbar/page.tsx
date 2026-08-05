"use client";

import React from "react";
import { Bell, ChevronDown } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
      <button className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="flex items-center gap-5">
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={20} />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
            3
          </span>
        </button>
        <button className="flex items-center gap-2">
          <img
            src="https://i.pravatar.cc/64?img=12"
            alt="Admin"
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="text-sm font-medium text-slate-700">Admin</span>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}