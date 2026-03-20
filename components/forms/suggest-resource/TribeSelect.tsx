"use client";

import { useState } from "react";
import { TRIBES } from "@/lib/tribes";

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function TribeSelect({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = TRIBES.filter((tribe) =>
    tribe.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">

      {/* Input */}
      <input
        value={value || query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(""); // clear selection while typing
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search for a tribe..."
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
      />

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">

          {filtered.map((tribe) => (
            <div
              key={tribe}
              onClick={() => {
                onChange(tribe);
                setQuery("");
                setOpen(false);
              }}
              className="px-4 py-2 cursor-pointer hover:bg-accent/10 text-text-primary"
            >
              {tribe}
            </div>
          ))}

        </div>
      )}
    </div>
  );
}