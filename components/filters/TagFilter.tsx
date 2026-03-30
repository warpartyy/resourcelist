"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatTag } from "@/lib/utils/formatTag";

type Props = {
  availableTags: string[];
  selectedTags: string[];
};

export default function TagFilter({
  availableTags,
  selectedTags,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTag = (tag: string) => {
    const current = new Set(selectedTags);

    if (current.has(tag)) {
      current.delete(tag);
    } else {
      current.add(tag);
    }

    const newTags = Array.from(current);

    const params = new URLSearchParams(searchParams.toString());

    if (newTags.length > 0) {
      params.set("tags", newTags.join(","));
    } else {
      params.delete("tags");
    }

    router.push(`?${params.toString()}`);
  };

return (
  <div className="relative" ref={ref}>
    <button
      onClick={() => setOpen((prev) => !prev)}
      className="px-4 py-2 border border-border rounded-lg text-sm bg-bg hover:border-accent transition"
    >
      Filter by Tags {selectedTags.length > 0 && `(${selectedTags.length})`} ▾
    </button>

    {open && (
      <div className="absolute right-0 z-20 mt-2 w-72 bg-surface border border-border rounded-xl shadow-lg p-2">

        {availableTags.length === 0 && (
          <p className="text-sm text-text-muted">
            No tags available
          </p>
        )}

        <div className="flex flex-col divide-y divide-border">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);

            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`w-full text-left px-3 py-2 text-sm transition ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "text-text-primary hover:bg-bg"
                }`}
              >
                <span className="flex items-center gap-2">
                  {isSelected && "✓"}
                  {formatTag(tag)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    )}
  </div>
);
}