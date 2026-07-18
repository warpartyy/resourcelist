import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Left: Branding */}
          <div className="text-center md:text-left">
            <p className="footer-brand">
              Motive For Movement
            </p>

            <p className="footer-tagline">
              Community-driven access to essential services.
            </p>

            <p className="footer-meta">
              © {new Date().getFullYear()} Motive For Movement
            </p>
          </div>


          

<nav className="flex flex-col gap-2 text-sm">
  <Link href="/resources">Browse Resources</Link>
  <Link href="/submit">Submit a Resource</Link>
  <Link href="/admin">Admin Dashboard</Link>
</nav>

          {/* Right: 988 Logo */}
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