import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 text-zinc-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Left: Branding */}
          <div className="text-center md:text-left">
            <p className="text-lg font-semibold text-white tracking-tight">
              War Party Resources
            </p>

            <p className="text-sm mt-1">
              Community-driven access to essential services.
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              © {new Date().getFullYear()} War Party
            </p>
          </div>

          {/* Right: 988 Logo (desktop only) */}
          <div className="hidden md:flex items-center justify-end">
            <Image
              src="/988-logo.png"
              alt="Call or Text 988"
              width={160}
              height={60}
              className="object-contain opacity-90"
            />
          </div>

        </div>

      </div>
    </footer>
  );
}
