"use client";

import { useRouter } from "next/navigation";

export default function ClearFilters() {
  const router = useRouter();

  const handleClear = () => {
    router.push("?"); // ✅ removes ALL query params
  };

  return (
    <button
      onClick={handleClear}
      className="px-4 py-2 text-sm border border-border rounded-lg bg-bg hover:border-accent transition text-text-muted hover:text-text-primary"
    >
      Clear Filters
    </button>
  );
}