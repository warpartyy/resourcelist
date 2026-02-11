import Link from "next/link";

export default function CategoryCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-800 transition"
    >
      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <p className="text-zinc-400 mt-2">
        {description}
      </p>
    </Link>
  );
}
