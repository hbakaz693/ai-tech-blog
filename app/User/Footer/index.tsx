"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="flex items-center justify-between px-8 py-4 border-t border-gray-200 text-xs text-gray-400">
      <span>Copyright © dov dov  & Template Market</span>
      <div className="flex gap-4">
        <span className="hover:text-gray-600 cursor-pointer">GitHub</span>
        <span className="hover:text-gray-600 cursor-pointer">LinkedIn</span>
        <span className="hover:text-gray-600 cursor-pointer">Twitter</span>
      </div>
    </footer>
  );
}