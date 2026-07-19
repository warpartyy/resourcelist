"use client";

import { useEffect, useRef } from "react";

export function useScrollToActiveResourceCard(
  editingId: string | null,
  retryKey: string | number | null = null
) {
  const lastScrolledIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!editingId) {
      lastScrolledIdRef.current = null;
      return;
    }

    if (lastScrolledIdRef.current === editingId) {
      return;
    }

    const target = document.querySelector<HTMLElement>(
      `[data-resource-card-id="${editingId}"]`
    );

    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    lastScrolledIdRef.current = editingId;
  }, [editingId, retryKey]);
}
