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
    <div className="card category-card">
  <Link href={href} className="category-title">
    {title}
    <span>→</span>
  </Link>

  <div className="category-divider" />

  <ul className="subcategory-list">
    {subcategories.map((sub) => (
      <li key={sub.href} className="subcategory-item">
        <span className="subcategory-bullet" />
        <Link href={sub.href} className="subcategory-link">
          {sub.label}
        </Link>
      </li>
    ))}
  </ul>
</div>
  );
}
