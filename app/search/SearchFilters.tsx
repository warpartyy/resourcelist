"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PARENT_CATEGORIES, SUBCATEGORIES } from "@/lib/taxonomy";

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [parent, setParent] = useState(searchParams.get("parent") || "");
  const [sub, setSub] = useState(searchParams.get("sub") || "");
  const [county, setCounty] = useState(searchParams.get("county") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [tags, setTags] = useState(searchParams.get("tags") || "");
  const [open, setOpen] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (parent) params.set("parent", parent);
    if (sub) params.set("sub", sub);
    if (county) params.set("county", county);
    if (state) params.set("state", state);
    if (tags) params.set("tags", tags);

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/search");
  };

  return (
  <div className="bg-surface border border-border rounded-2xl shadow-lg overflow-hidden">

    {/* Header (clickable on mobile) */}
    <button
      onClick={() => setOpen(!open)}
      className="w-full px-4 py-4 flex justify-between items-center lg:cursor-default"
    >
      <h2 className="text-lg font-semibold">
        Filters
      </h2>

      {/* Only show toggle text on mobile */}
      <span className="text-sm text-text-muted lg:hidden">
        {open ? "Hide" : "Show"}
      </span>
    </button>

    {/* Collapsible Content */}
    <div
      className={`
        px-4 pb-5 space-y-4
        transition-all duration-300
        ${open ? "block" : "hidden"}
        lg:block
      `}
    >
      {/* Parent Category */}
      <div>
        <label className="block text-xs text-text-muted mb-1">
          Parent Category
        </label>
        <select
          value={parent}
          onChange={(e) => setParent(e.target.value)}
          className="w-full bg-bg border border-border rounded-lg p-2 text-sm"
        >
          <option value="">All</option>
          {PARENT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory */}
      <div>
        <label className="block text-xs text-text-muted mb-1">
          Subcategory
        </label>
        <select
          value={sub}
          onChange={(e) => setSub(e.target.value)}
          className="w-full bg-bg border border-border rounded-lg p-2 text-sm"
        >
          <option value="">All</option>
          {SUBCATEGORIES.map((subcat) => (
            <option key={subcat.value} value={subcat.value}>
              {subcat.label}
            </option>
          ))}
        </select>
      </div>

      {/* County */}
      <div>
        <label className="block text-xs text-text-muted mb-1">
          County
        </label>
        <input
          type="text"
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          className="w-full bg-bg border border-border rounded-lg p-2 text-sm"
        />
      </div>

      {/* State */}
      <div>
        <label className="block text-xs text-text-muted mb-1">
          State
        </label>
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full bg-bg border border-border rounded-lg p-2 text-sm"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs text-text-muted mb-1">
          Tags
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="outpatient, detox"
          className="w-full bg-bg border border-border rounded-lg p-2 text-sm"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={applyFilters}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          Apply
        </button>

        <button
          onClick={clearFilters}
          className="border border-border text-text-primary px-4 py-2 rounded-lg text-sm hover:bg-surface transition"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
);

}
