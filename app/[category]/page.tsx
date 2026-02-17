import { getSupabase } from "@/lib/supabase";
import ResourceCard from "../../components/ResourceCard";
import Container from "../../components/ui/Container";
import Link from "next/link";
import {PARENT_CATEGORIES, SUBCATEGORIES, SUBCATEGORY_PARENT_MAP,} from "@/lib/taxonomy";
import SubcategorySection from "../../components/SubcategorySection";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
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

const supabase = getSupabase();

if (isParentCategory) {
  const { data, error: queryError } = await supabase
    .from("resources")
    .select("*")
    .contains("parent_categories", [category]);

  resources = data || [];
  error = queryError;
}

if (isSubcategory) {
  const { data, error: queryError } = await supabase
    .from("resources")
    .select("*")
    .contains("subcategories", [category]);

  resources = data || [];
  error = queryError;
}


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
  <div className="text-sm text-zinc-500 pt-4 mb-4 flex items-center flex-wrap gap-2">
    <Link href="/" className="hover:text-white transition">
      Home
    </Link>

    <span>›</span>

    {isSubcategory && parentSlug && (
      <>
        <Link
          href={`/${parentSlug}`}
          className="hover:text-white transition"
        >
          {parentLabel}
        </Link>

        <span>›</span>
      </>
    )}

    <span className="text-zinc-300">
      {currentLabel}
    </span>
  </div>

  {/* Title */}
  <h1 className="text-4xl font-semibold tracking-tight mb-4">
    {displayTitle}
  </h1>

  {/* Parent Description */}
  {isParentCategory && parentDescription && (
    <p className="text-zinc-400 max-w-2xl leading-relaxed">
      {parentDescription}
    </p>
  )}

  {/* Subcategory Description */}
  {isSubcategory && (
    <p className="text-zinc-400 max-w-2xl leading-relaxed">
      {
        SUBCATEGORIES.find((sub) => sub.value === category)
          ?.description
      }
    </p>
  )}

</div>

{isParentCategory && (
  <div className="text-sm text-zinc-500 mt-4">
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


{/* Divider */}
<div className="relative left-1/2 right-1/2 -mx-[48vw] w-[96vw] border-b border-zinc-800 mb-2 md:mb-4" />





      {/* ---------------- SUBCATEGORY PAGE ---------------- */}
      {isSubcategory && (
        <div className="grid gap-6">
          {resources
            ?.filter((r) =>
              r.subcategories?.includes(category)
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
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-3">
                We’re Adding More Resources
              </h2>

              <p className="text-zinc-300 mb-4">
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

          {SUBCATEGORIES.filter(
            (sub) =>
              SUBCATEGORY_PARENT_MAP[sub.value] === category
          ).map((sub) => {
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
