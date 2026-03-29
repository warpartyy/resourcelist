import ResourceCard from "../../components/ResourceCard";
import Container from "../../components/ui/Container";
import Link from "next/link";
import {PARENT_CATEGORIES, SUBCATEGORIES, SUBCATEGORY_PARENT_MAP,} from "@/lib/taxonomy";
import SubcategorySection from "../../components/SubcategorySection";
import { notFound } from "next/navigation";
import { buildResourceQuery } from "@/lib/queries/buildResourceQuery";
import FiltersBar from "../../components/filters/FiltersBar";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: Promise<{
    q?: string;
    sub?: string;
    tags?: string;
    county?: string;
    state?: string;
  }>;
}) {
  const { category } = await params;

  const isParentCategory = PARENT_CATEGORIES.some(
    (cat) => cat.value === category
  );

  const isSubcategory = SUBCATEGORIES.some(
    (sub) => sub.value === category
  );

const parentCategory = PARENT_CATEGORIES.find(
  (cat) => cat.value === category
);

const parentDescription = parentCategory?.description;

const filters = await searchParams;
  let parentSlug: string | null = null;

  if (isSubcategory) {
    parentSlug = SUBCATEGORY_PARENT_MAP[category];
  }

  const parentLabel = PARENT_CATEGORIES.find(
    (cat) => cat.value === parentSlug
  )?.label;

  const currentLabel =
    PARENT_CATEGORIES.find((cat) => cat.value === category)?.label ||
    SUBCATEGORIES.find((sub) => sub.value === category)?.label;



if (!isParentCategory && !isSubcategory) {
  notFound();
}


  

let resources: any[] = [];
let error: any = null;

const query = await buildResourceQuery({
  ...filters,
  parent: isParentCategory ? category : undefined,
  sub: isSubcategory ? category : filters.sub,
});

const { data, error: queryError } = await query;

resources = data || [];
// --- derive available tags from current results ---
const availableTags = Array.from(
  new Set(resources.flatMap((r) => r.tags || []))
).sort();

const selectedTags =
  filters.tags?.split(",") ?? [];

error = queryError;

if (error) {
  return (
    <Container>
      <p>Error loading resources.</p>
    </Container>
  );
}

  const resourceCount = resources.length;

const mostRecentVerification =
  resources
    .map((r) => r.last_verified)
    .filter(Boolean)
    .sort()
    .reverse()[0] || null;

const formattedDate = mostRecentVerification
  ? new Date(mostRecentVerification).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  : null;

const displayTitle =
  PARENT_CATEGORIES.find((cat) => cat.value === category)?.label ||
  SUBCATEGORIES.find((sub) => sub.value === category)?.label ||
  category;


  return (
    <Container>

{/* ---------------- Header Block ---------------- */}
<div className="mb-5">

  {/* Breadcrumb */}
  <div className="text-sm text-text-subtle pt-4 mb-4 flex items-center flex-wrap gap-2">
    <Link href="/" className="hover:text-text-primary transition">
      Home
    </Link>

    <span>›</span>

    {isSubcategory && parentSlug && (
      <>
        <Link
          href={`/${parentSlug}`}
          className="hover:text-text-primary transition"
        >
          {parentLabel}
        </Link>

        <span>›</span>
      </>
    )}

    <span className="text-text-primary">
      {currentLabel}
    </span>
  </div>

  {/* Title */}
  <h1 className="text-4xl font-semibold tracking-tight mb-4">
    {displayTitle}
  </h1>

  {/* Parent Description */}
  {isParentCategory && parentDescription && (
    <p className="text-text-muted max-w-2xl leading-relaxed">
      {parentDescription}
    </p>
  )}

  {/* Subcategory Description */}
  {isSubcategory && (
    <p className="text-text-muted max-w-2xl leading-relaxed">
      {
        SUBCATEGORIES.find((sub) => sub.value === category)
          ?.description
      }
    </p>
  )}

</div>

{isParentCategory && (
  <div className="text-sm text-text-subtle mt-4">
    {resourceCount > 0 ? (
      <>
        Showing {resourceCount}{" "}
        {resourceCount === 1 ? "resource" : "resources"}
        {formattedDate && ` · Last updated ${formattedDate}`}
      </>
    ) : (
      <>No resources yet · We’re actively expanding this category</>
    )}
  </div>
)}

<FiltersBar
  availableTags={availableTags}
  selectedTags={selectedTags}
  searchParams={filters as any}
/>

{/* Divider */}
<div className="relative left-1/2 right-1/2 -mx-[48vw] w-[96vw] border-b border-border mb-2 md:mb-4" />

      {/* ---------------- SUBCATEGORY PAGE ---------------- */}
      {isSubcategory && (
        <div className="grid gap-6">
          {resources
            ?.filter((r) =>
              r.subcategories?.includes(category)
            )
            .sort((a, b) =>
             a.organization.localeCompare(b.organization)
            )
            .map((resource: any) => (
              <ResourceCard
                key={resource.id}
                resource={{
                  ...resource,
                  countiesServed: resource.counties_served,
                }}
              />
            ))}

          {resources?.filter((r) =>
            r.subcategories?.includes(category)
          ).length === 0 && (
            <div className="bg-bg border border-border p-8 rounded-2xl text-center max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-3">
                We’re Adding More Resources
              </h2>

              <p className="text-text-primary mb-4">
                This section is growing. Help expand access by
                suggesting a resource.
              </p>

              <Link
                href="/suggest-resource"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
              >
                Suggest a Resource →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ---------------- PARENT CATEGORY PAGE ---------------- */}
      {isParentCategory && (
        <div className="space-y-2 md:space-y-3">

          {SUBCATEGORIES
            .filter(
              (sub) =>
                SUBCATEGORY_PARENT_MAP[sub.value] === category
            )
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((sub) => {
              const filteredResources = resources?.filter((r) =>
                r.subcategories?.includes(sub.value)
              );

              return (
                <SubcategorySection
                  key={sub.value}
                  sub={sub}
                  resources={filteredResources || []}
                 />
              );
            })}


        </div>
      )}
    </Container>
  );
}
