"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  availableServices: string[];
  selectedServices: string[];
};

export default function ServicesFilter({
  availableServices,
  selectedServices,
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

  const toggleService = (service: string) => {
    const current = new Set(selectedServices);

    if (current.has(service)) {
      current.delete(service);
    } else {
      current.add(service);
    }

    const newServices = Array.from(current);

    const params = new URLSearchParams(searchParams.toString());

    if (newServices.length > 0) {
      params.set("services", newServices.join(","));
    } else {
      params.delete("services");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="px-4 py-2 border border-border rounded-lg text-sm bg-bg hover:border-accent transition"
      >
        Filter by Services {selectedServices.length > 0 && `(${selectedServices.length})`} ▾
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 bg-surface border border-border rounded-xl shadow-lg p-2">

          {availableServices.length === 0 && (
            <p className="text-sm text-text-muted">
              No services available
            </p>
          )}

          <div className="flex flex-col divide-y divide-border">
            {availableServices.map((service) => {
              const isSelected = selectedServices.includes(service);

              return (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
className={`w-full text-left px-3 py-2 text-sm transition ${
  isSelected
    ? "bg-blue-600 text-white"
    : "text-text-primary hover:bg-bg"
}`}
                >
                  <span className="flex items-center gap-2">
  {isSelected && "✓"}
  {service}
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