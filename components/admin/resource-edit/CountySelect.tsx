"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  selected: string[];
  onChange: (val: string[]) => void;
  options: string[];
};

export default function CountySelect({
  selected,
  onChange,
  options,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
  const filtered = options.filter(
    (county) =>
      county.toLowerCase().includes(query.toLowerCase()) &&
      !selected.includes(county)
  );

  const addCounty = (county: string) => {
  onChange([...selected, county]);
  setQuery("");
  setOpen(true); // stays open for rapid selection
};

  const removeCounty = (county: string) => {
    onChange(selected.filter((c) => c !== county));
  };

  return (
    <div ref={containerRef} className="relative">

      {/* Selected Pills */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((county) => (
          <div
            key={county}
            className="bg-accent border border-border text-text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {county}
            <button
              type="button"
              onClick={() => removeCounty(county)}
              className="text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Input */}
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search counties..."
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
      />

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">

          {filtered.map((county) => (
            <div
              key={county}
              onClick={() => addCounty(county)}
              className="px-4 py-2 cursor-pointer hover:bg-accent/10"
            >
              {county}
            </div>
          ))}

        </div>
      )}
    </div>
  );
}