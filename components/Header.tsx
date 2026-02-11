import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-black text-white">
      <div className="max-w-6xl mx-auto h-16 flex items-center justify-between px-6">

        {/* Logo / Home Link */}
        <Link href="/" className="font-semibold text-lg hover:text-zinc-300">
          Oklahoma Resource Navigator
        </Link>

        {/* Resources Dropdown */}
        <div className="relative group">
          <button className="flex items-center space-x-1 hover:text-zinc-300">
            <span>Resources</span>
            <span>▼</span>
          </button>

          <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
            <div className="flex flex-col p-2 text-sm">
              <Link href="/food" className="px-3 py-2 hover:bg-zinc-800 rounded-md">
                Food Assistance
              </Link>
              <Link href="/housing" className="px-3 py-2 hover:bg-zinc-800 rounded-md">
                Housing Support
              </Link>
              <Link href="/substance-use" className="px-3 py-2 hover:bg-zinc-800 rounded-md">
                Substance Use Treatment
              </Link>
              <Link href="/mental-health" className="px-3 py-2 hover:bg-zinc-800 rounded-md">
                Mental Health Services
              </Link>
              <Link href="/transportation" className="px-3 py-2 hover:bg-zinc-800 rounded-md">
                Transportation
              </Link>
              <Link href="/employment" className="px-3 py-2 hover:bg-zinc-800 rounded-md">
                Employment
              </Link>
              <Link href="/healthcare" className="px-3 py-2 hover:bg-zinc-800 rounded-md">
                Healthcare
              </Link>
              <Link href="/financial-assistance" className="px-3 py-2 hover:bg-zinc-800 rounded-md">
                Financial Assistance
              </Link>
              <Link href="/legal" className="px-3 py-2 hover:bg-zinc-800 rounded-md">
                Legal Assistance
              </Link>
              <Link href="/domestic-violence" className="px-3 py-2 hover:bg-zinc-800 rounded-md">
                Domestic Violence & Safety
              </Link>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
