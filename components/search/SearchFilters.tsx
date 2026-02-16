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
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">

      <h2 className="text-xl font-semibold">
        Filters
      </h2>

      {/* Parent Category */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">
          Parent Category
        </label>
        <select
          value={parent}
          onChange={(e) => setParent(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2"
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
        <label className="block text-sm text-zinc-400 mb-2">
          Subcategory
        </label>
        <select
          value={sub}
          onChange={(e) => setSub(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2"
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
        <label className="block text-sm text-zinc-400 mb-2">
          County
        </label>
        <input
          type="text"
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          placeholder="e.g. Caddo"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2"
        />
      </div>

      {/* State */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">
          State
        </label>
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="e.g. OK"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2"
        />
      </div>

      {/* Tags (comma separated for now) */}
      <div>
        <label className="block text-sm text-zinc-400 mb-2">
          Tags
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. outpatient,detox"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={applyFilters}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Apply Filters
        </button>

        <button
          onClick={clearFilters}
          className="border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-800 transition"
        >
          Clear
        </button>
      </div>

    </div>
  );
}
