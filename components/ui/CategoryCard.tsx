import Link from "next/link";

type Subcategory = {
  label: string;
  href: string;
};

export default function CategoryCard({
  href,
  title,
  subcategories,
}: {
  href: string;
  title: string;
  subcategories: Subcategory[];
}) {
  return (
    <div
      className="
        group
        bg-zinc-900
        border border-zinc-800
        p-6
        rounded-2xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-zinc-700
        hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]
      "
    >
      {/* Title */}
      <Link
        href={href}
        className="
          text-xl
          font-semibold
          text-white
          hover:text-blue-400
          transition
          inline-flex
          items-center
          gap-2
        "
      >
        {title}
        <span className="text-sm text-zinc-500 group-hover:text-blue-400 transition">
          →
        </span>
      </Link>

      {/* Divider */}
      <div className="h-px bg-zinc-800 my-4 group-hover:bg-zinc-700 transition" />

      {/* Subcategory List */}
      <ul className="space-y-2">
        {subcategories.map((sub) => (
          <li key={sub.href} className="flex items-start gap-2">
            {/* Subtle Bullet */}
            <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-zinc-600 group-hover:bg-blue-400 transition" />

            <Link
              href={sub.href}
              className="
                text-sm
                text-zinc-400
                hover:text-white
                transition
              "
            >
              {sub.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
