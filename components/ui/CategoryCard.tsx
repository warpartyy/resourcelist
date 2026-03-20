import Link from "next/link";

type Subcategory = {
  label: string;
  href: string;
};

export default function CategoryCard({
  href,
  title,
  description,
  subcategories,
}: {
  href: string;
  title: string;
  description?: string;
  subcategories?: Subcategory[];
}) {
  return (
    <div className="card category-card">
  <Link href={href} className="category-title">
    {title}
    <span>→</span>
  </Link>

{description && (
  <p className="text-sm text-text-muted mt-2">
    {description}
  </p>
)}

  <div className="category-divider" />
  <ul className="subcategory-list">
    {subcategories?.map((sub) => (
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
