"use client";

import React from "react";
import { Status } from "../types";

export default function StatusBadge({ status }: { status: Status }) {
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