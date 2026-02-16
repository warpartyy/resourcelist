"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Safe body scroll lock
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuOpen]);

  const navLinkClass = (href: string) =>
    `text-sm transition ${
      pathname === href
        ? "text-white font-medium"
        : "text-zinc-400 hover:text-white"
    }`;

  const navLinkBase =
    "text-sm transition text-zinc-400 hover:text-white";

  const navLinkActive =
    "text-sm transition text-white font-medium";

  const isCategoryRoute = [
    "/health-wellness",
    "/essential-support",
    "/work-money-legal",
    "/safety-crisis",
    "/family-community-support",
  ].includes(pathname);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-[100] transition-all duration-300
        ${
            scrolled
  ? "bg-black/90 border-b border-zinc-900 shadow-md"

            : "bg-black border-b border-zinc-900"
        }
      `}
    >
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-4">


        {/* Logo */}
<Link
  href="/"
  className="flex items-center gap-3 text-white hover:text-zinc-300 transition"
>
  <Image
    src="/war-party-logo.png"   // 👈 change to your actual file name
    alt="War Party Logo"
    width={36}
    height={36}
    className="object-contain"
  />

  <span className="text-xl font-semibold tracking-tight">
    Resources
  </span>
</Link>


        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-zinc-900 transition"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">

          {/* Resources Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              className={`flex items-center gap-1 ${
                isCategoryRoute ? navLinkActive : navLinkBase
              }`}
            >
              Resources
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`
                absolute right-0 mt-4 w-64 rounded-xl border border-zinc-800
                bg-black shadow-xl transition-all duration-200
                ${
                  dropdownOpen
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 -translate-y-2 invisible"
                }
              `}
            >
              <div className="flex flex-col p-2 text-sm">
                {[
                  ["Health & Wellness", "/health-wellness"],
                  ["Essential Support", "/essential-support"],
                  ["Work, Money & Legal", "/work-money-legal"],
                  ["Safety & Crisis", "/safety-crisis"],
                  ["Family & Community Support", "/family-community-support"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-2 rounded-md transition ${
                      pathname === href
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/about" className={navLinkClass("/about")}>
            About
          </Link>

          <Link href="/how-it-works" className={navLinkClass("/how-it-works")}>
            How It Works
          </Link>

          <Link
            href="/suggest-resource"
            className="text-sm px-4 py-2 rounded-lg transition bg-blue-600 hover:bg-blue-700 text-white"
          >
            Suggest a Resource
          </Link>
        </div>
      </div>

      {/* Mobile Overlay — ONLY mounted when open */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sliding Panel */}
          <div
            className="relative ml-auto w-full max-w-sm h-full bg-zinc-950
                       border-l border-zinc-900 shadow-2xl flex flex-col
                       animate-slide-in"
          >

            {/* Top Bar */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-900">
              <span className="text-lg font-medium">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-zinc-900 transition"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col px-6 py-8 overflow-y-auto">
              {[
                ["Health & Wellness", "/health-wellness"],
                ["Essential Support", "/essential-support"],
                ["Work, Money & Legal", "/work-money-legal"],
                ["Safety & Crisis", "/safety-crisis"],
                ["Family & Community Support", "/family-community-support"],
                ["About", "/about"],
                ["How It Works", "/how-it-works"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-4 border-b border-zinc-900 text-lg font-medium hover:text-white text-zinc-300 transition"
                >
                  {label}
                </Link>
              ))}

              <Link
                href="/suggest-resource"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-xl font-medium text-lg transition"
              >
                Suggest a Resource
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
