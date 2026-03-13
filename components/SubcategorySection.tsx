"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type Resource = {
  id: string;
  slug: string;
  organization: string;
  city?: string;
  state?: string;
};

type Props = {
  sub: {
    label: string;
    value: string;
    description?: string;
  };
  resources: Resource[];
};

export default function SubcategorySection({
  sub,
  resources,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-surface mb-4">

      {/* Subcategory Header */}
      <div
  className="flex items-center justify-between cursor-pointer px-4 py-4 hover:bg-surface-hover transition"
  onClick={() => setOpen(!open)}
>
        <div>
          <Link
            href={`/${sub.value}`}
            onClick={(e) => e.stopPropagation()}
            className="text-2xl font-semibold hover:text-blue-400 transition"
          >
            {sub.label}
          </Link>

          {sub.description && (
            <p className="text-sm text-text-subtle mt-2 max-w-2xl">
              {sub.description}
            </p>
          )}
        </div>

        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          } text-text-subtle`}
        />
      </div>

      {/* Resource List */}
      {open && (
        <div className="border-t border-border">


          {resources.length > 0 ? (
            resources.map((resource) => (
              <Link
  key={resource.id}
  href={`/resources/${resource.slug}`}
  className="
  group
  flex items-center justify-between
  px-4 py-3
  border-b border-border last:border-b-0
  hover:bg-surface-hover
  transition-colors
"
>
  <div>
  <div className="font-medium text-text-primary">
    {resource.organization}
  </div>

  {resource.city && (
    <div className="text-sm text-text-muted mt-1">
      {resource.city}, {resource.state}
    </div>
  )}
</div>

<span className="text-text-muted transition-transform group-hover:translate-x-1">
  →
</span>

</Link>
            ))
          ) : (
            <div className="px-4 py-4 text-sm text-text-subtle">
              We’re adding more resources in this area.
              <br />
                Help expand access by{" "}
              <Link
                href="/suggest-resource"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                suggesting one →
              </Link>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
