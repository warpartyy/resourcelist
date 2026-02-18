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

const RESOURCE_NAV = [
  {
    label: "Health & Wellness",
    href: "/health-wellness",
    children: [
      { label: "Mental Health Services", href: "/mental-health-services" },
      { label: "Substance Use & Recovery", href: "/substance-use-recovery" },
      { label: "General Healthcare Services", href: "/general-healthcare-services" },
      { label: "Support Groups", href: "/support-groups" },
    ],
  },
  {
    label: "Essential Support",
    href: "/essential-support",
    children: [
      { label: "Housing Support", href: "/housing-support" },
      { label: "Food Assistance", href: "/food-assistance" },
      { label: "Transportation Services", href: "/transportation-services" },
      { label: "Utility & Rental Assistance", href: "/utility-rental-assistance" },
    ],
  },
  {
    label: "Work, Money & Legal",
    href: "/work-money-legal",
    children: [
      { label: "Employment & Job Support", href: "/employment-job-support" },
      { label: "Financial & Benefits Assistance", href: "/financial-benefits-assistance" },
      { label: "Legal Assistance", href: "/legal-assistance" },
    ],
  },
  {
    label: "Safety & Crisis",
    href: "/safety-crisis",
    children: [
      { label: "Domestic Violence & Safety", href: "/domestic-violence-safety" },
      { label: "Crisis Services", href: "/crisis-services" },
      { label: "Emergency Shelter", href: "/emergency-shelter" },
    ],
  },
  {
    label: "Family & Community Support",
    href: "/family-community-support",
    children: [
      { label: "Youth Programs", href: "/youth-programs" },
      { label: "Parenting & Family Support", href: "/parenting-family-support" },
      { label: "Peer Support Services", href: "/peer-support-services" },
      { label: "Community & Cultural Programs", href: "/community-cultural-programs" },
    ],
  },
];


return (
  <header
    className={`
      sticky top-0 z-[100] transition-all duration-300
      bg-black border-b border-zinc-900
      ${scrolled ? "shadow-md" : ""}
      `}

  >
    <div className="max-w-7xl mx-auto px-4">

      {/* Main Header Row */}
      <div className="flex items-center justify-between h-16">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 text-white hover:text-zinc-300 transition"
        >
          <Image
            src="/war-party-logo.png"
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
                absolute right-0 mt-4 w-80 rounded-xl border border-zinc-800
                bg-black shadow-xl transition-all duration-200
                ${
                  dropdownOpen
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 -translate-y-2 invisible"
                }
              `}
            >
              <div className="flex flex-col p-3 text-sm w-80">
                {RESOURCE_NAV.map((parent) => (
                  <div key={parent.href} className="mb-4">

                    <Link
                      href={parent.href}
                      className={`block px-3 py-2 rounded-md font-semibold transition ${
                        pathname === parent.href
                          ? "bg-zinc-900 text-white"
                          : "text-white hover:bg-zinc-900"
                      }`}
                    >
                      {parent.label}
                    </Link>

                    <div className="ml-4 mt-1 flex flex-col space-y-1">
                      {parent.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`px-3 py-1 rounded-md text-zinc-400 hover:bg-zinc-900 hover:text-white transition ${
                            pathname === child.href ? "text-white" : ""
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

          <form action="/search">
            <input
              name="q"
              placeholder="Search resources"
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1 text-sm"
            />
          </form>

        </div>
      </div>

      {/* Mobile Search Row */}
      <div className="md:hidden border-t border-zinc-900 py-3">
        <form action="/search">
          <input
            type="text"
            name="q"
            placeholder="Search resources..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </form>
      </div>

    </div>

    {/* Mobile Overlay — ONLY mounted when open */}
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-50 flex w-screen">


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
          <div className="flex flex-col px-4 py-2 overflow-y-auto space-y-6">

            {/* Mobile Search */}
            <form action="/search" className="mb-2">
              <input
                type="text"
                name="q"
                placeholder="Search resources..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </form>

            {RESOURCE_NAV.map((parent) => (
              <div key={parent.href}>

                {/* Parent */}
                <Link
                  href={parent.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-lg font-semibold py-2 text-white"
                >
                  {parent.label}
                </Link>

                {/* Children */}
                <div className="ml-4 flex flex-col space-y-1">
                  {parent.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-zinc-400 hover:text-white transition"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>

              </div>
            ))}

            {/* Static Links */}
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium pt-6 border-t border-zinc-900"
            >
              About
            </Link>

            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium"
            >
              How It Works
            </Link>

            <Link
              href="/suggest-resource"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-xl font-medium text-lg transition"
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