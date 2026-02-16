"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type Props = {
  sub: {
    label: string;
    value: string;
    description?: string;
  };
  resources: any[];
};

export default function SubcategorySection({
  sub,
  resources,
}: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="pt-1 pb-4 md:pt-2 md:pb-5 border-b border-zinc-800">





      {/* Subcategory Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
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
            <p className="text-sm text-zinc-500 mt-2 max-w-2xl">
              {sub.description}
            </p>
          )}
        </div>

        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          } text-zinc-500`}
        />
      </div>

      {/* Resource List */}
      {open && (
        <div className="mt-4 space-y-3">


          {resources.length > 0 ? (
            resources.map((resource) => (
              <Link
                key={resource.id}
                href={`/resources/${resource.slug}`}
                className="block px-4 py-3 rounded-lg hover:bg-zinc-900 transition border border-transparent hover:border-zinc-800"
              >



                
                <div className="font-medium text-white">
                  {resource.organization}
                </div>

                <div className="text-sm text-zinc-400 mt-1">
                  {resource.counties_served?.join(", ")}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-zinc-500">
              We’re adding more resources in this area.{" "}
              <Link
                href="/suggest-resource"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
              >
                Suggest one →
              </Link>
            </p>
          )}

        </div>
      )}
    </div>
  );
}
