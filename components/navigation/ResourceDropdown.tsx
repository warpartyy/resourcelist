"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

type Props = {
  pathname: string;
  dropdownOpen: boolean;
  setDropdownOpen: (value: boolean) => void;
  RESOURCE_NAV: any[];
};

export default function ResourceDropdown({
  pathname,
  dropdownOpen,
  setDropdownOpen,
  RESOURCE_NAV,
}: Props) {
  return (
    <div
      className="nav-dropdown"
      onMouseEnter={() => setDropdownOpen(true)}
      onMouseLeave={() => setDropdownOpen(false)}
    >
      <button className="flex items-center gap-1 nav-link">
        Resources
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`resource-dropdown ${
          dropdownOpen ? "dropdown-open" : "dropdown-closed"
        }`}
      >
        <div className="flex flex-col p-3 text-sm w-80">
          {RESOURCE_NAV.map((parent) => (
            <div key={parent.href} className="mb-4">

              <Link
                href={parent.href}
                className={`dropdown-parent ${
                  pathname === parent.href
                    ? "dropdown-parent-active"
                    : ""
                }`}
              >
                {parent.label}
              </Link>

              <div className="dropdown-children">
                {parent.children.map((child: any) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`dropdown-link ${
                      pathname === child.href
                        ? "dropdown-link-active"
                        : ""
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}