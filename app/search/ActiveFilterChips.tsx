"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PARENT_CATEGORIES, SUBCATEGORIES } from "@/lib/taxonomy";

const SUBCATEGORY_LABELS = new Map(
  SUBCATEGORIES.map((subcategory) => [subcategory.value, subcategory.label]),
);
const PARENT_CATEGORY_LABELS = new Map(
  PARENT_CATEGORIES.map((category) => [category.value, category.label]),
);

export default function ActiveFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const chips = getActiveFilterChips(searchParams);

  if (chips.length === 0) {
    return null;
  }

  const removeFilter = (chip: ActiveFilterChip) => {
    const params = new URLSearchParams(searchParams.toString());

    if (chip.value) {
      const nextValues = readMultiValue(params.get(chip.key)).filter(
        (value) => value !== chip.value,
      );

      if (nextValues.length > 0) {
        params.set(chip.key, nextValues.join(","));
      } else {
        params.delete(chip.key);
      }
    } else {
      params.delete(chip.key);
    }

    if (chip.key === "tribe") {
      params.delete("tribe");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex flex-wrap gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value ?? chip.label}`}
          type="button"
          onClick={() => removeFilter(chip)}
          className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-900 transition hover:bg-teal-100"
          aria-label={`Remove ${chip.label} filter`}
        >
          <span>{chip.label}</span>
          <span aria-hidden="true">x</span>
        </button>
      ))}
    </div>
  );
}

type ActiveFilterChip = {
  key: string;
  label: string;
  value?: string;
};

function getActiveFilterChips(searchParams: URLSearchParams): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  for (const value of readMultiValue(searchParams.get("state"))) {
    chips.push({ key: "state", label: value });
  }

  for (const value of readMultiValue(searchParams.get("county"))) {
    chips.push({ key: "county", label: value });
  }

  for (const value of readMultiValue(searchParams.get("sub"))) {
    chips.push({
      key: "sub",
      label: SUBCATEGORY_LABELS.get(value) ?? value,
      value,
    });
  }

  for (const value of readMultiValue(searchParams.get("tags"))) {
    chips.push({ key: "tags", label: value, value });
  }

  const selectedTribe = searchParams.get("tribe");

  if (selectedTribe) {
    chips.push({ key: "tribe", label: selectedTribe });
  }

  const parent = searchParams.get("parent");

  if (parent) {
    chips.push({
      key: "parent",
      label: PARENT_CATEGORY_LABELS.get(parent) ?? parent,
    });
  }

  return chips;
}

function readMultiValue(value: string | null) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}
