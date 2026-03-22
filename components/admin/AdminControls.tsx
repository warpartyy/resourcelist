"use client";

type Props = {
  search: string;
  setSearch: (value: string) => void;
  sortOrder: "az" | "za" | "newest" | "oldest";
  setSortOrder: (value: "az" | "za" | "newest" | "oldest") => void;
};

export default function AdminControls({
  search,
  setSearch,
  sortOrder,
  setSortOrder,
}: Props) {
  return (
    <div className="sticky top-16 z-30 bg-bg border-b border-border pt-3 pb-4 mb-6">
        <div className="px-6">
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-bg border border-border text-text-primary placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-accent/40"
        />

        <select
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(
              e.target.value as "az" | "za" | "newest" | "oldest"
            )
          }
          className="px-4 py-2 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          <option value="az">A–Z</option>
          <option value="za">Z–A</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>
    </div>
  );
}