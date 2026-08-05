"use client";

import React, { useState } from "react";

interface HeaderProps {
  currentPage: "home" | "shop";
  onPageChange: (page: "home" | "shop") => void;
}

export default function Header({ currentPage, onPageChange }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          TM
        </div>
        <span className="font-semibold text-gray-900">Template Market</span>
      </div>
      <nav className="flex items-center gap-8">
        <button
          onClick={() => onPageChange("home")}
          className={`text-sm font-medium transition-colors ${
            currentPage === "home"
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Home
        </button>
        <button
          onClick={() => onPageChange("shop")}
          className={`text-sm font-medium transition-colors ${
            currentPage === "shop"
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🛒 Boutique
        </button>
        <span className="text-gray-500 text-sm hover:text-gray-700 cursor-pointer">Articles</span>
      </nav>
    </header>
  );
}