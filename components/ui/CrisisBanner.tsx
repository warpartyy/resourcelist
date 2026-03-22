import Image from "next/image";
import { Bebas_Neue } from "next/font/google";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});

export default function CrisisBanner() {
  return (
    <div className="w-full bg-[#FFD100] text-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

        {/* Left: Logo + Message */}
<div className="flex items-center gap-2">
  <p className="text-sm font-medium leading-tight">
    In crisis? Call or text
  </p>

  <span
    className={`${bebas.className} text-2xl leading-none tracking-normal`}
  >
    988
  </span>

  <p className="text-sm font-medium leading-tight">
    for the Suicide & Crisis Lifeline.
  </p>
</div>

        {/* Right: Links */}
        <div className="hidden sm:flex items-center gap-4 text-sm font-medium">

          <a
            href="https://988lifeline.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80 transition"
          >
            National
          </a>

          <a
            href="https://988oklahoma.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80 transition"
          >
            Oklahoma
          </a>
        </div>

      </div>
    </div>
  );
}
