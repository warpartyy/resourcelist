// components/filters/FiltersBar.tsx

import Link from "next/link";

type FiltersBarProps = {
  availableTags: string[];
  selectedTags: string[];
  searchParams: Record<string, string | undefined>;
};

export default function FiltersBar({
  availableTags,
  selectedTags,
  searchParams,
}: FiltersBarProps) {
  if (availableTags.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {availableTags.map((tag) => {
        const isActive = selectedTags.includes(tag);

        const nextTags = isActive
          ? selectedTags.filter((t) => t !== tag)
          : [...selectedTags, tag];

        const params = new URLSearchParams(searchParams as any);

        if (nextTags.length > 0) {
          params.set("tags", nextTags.join(","));
        } else {
          params.delete("tags");
        }

        return (
          <Link
            key={tag}
            href={`?${params.toString()}`}
            className={`px-3 py-1 rounded-full text-sm transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {tag}
          </Link>
        );
      })}
    </div>
  );
}