import { getSupabase } from "@/lib/supabase";
import Container from "../../../components/ui/Container";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TAG_GROUPS } from "@/lib/taxonomy";

export default async function ResourcePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = getSupabase(); // 👈 add this

  const { slug } = await params;

  const { data: resource, error } = await supabase
    .from("resources")
    .select("*")
    .eq("slug", slug)
    .eq("status", "approved") // 🔥 CRITICAL FIX
    .single();

  if (error || !resource) {
    notFound();
  }


  const primaryCategory =
    resource.parent_categories?.[0] || null;

  const displayCategory = primaryCategory
    ? primaryCategory
        .split("-")
        .map((word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ")
    : null;

function formatWebsite(url?: string) {
  if (!url) return null;

  const normalized = url.startsWith("http") ? url : `https://${url}`;

  try {
    return new URL(normalized).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

const serviceTags =
  resource.tags?.filter((tag: string) =>
    TAG_GROUPS.serviceType.includes(tag)
  ) || [];

  return (
<Container>

  {/* Back Link */}
  {primaryCategory && displayCategory && (
    <div className="mb-4">
      <Link
        href={`/${primaryCategory}`}
        className="text-sm text-accent hover:underline"
      >
        ← Back to {displayCategory}
      </Link>
    </div>
  )}

  {/* ---------------- Header ---------------- */}
  <div className="mb-6">

    <h1 className="text-4xl font-bold tracking-tight mb-4">
      {resource.organization}
    </h1>

    <div className="space-y-2 text-sm text-text-muted">

<p>
  {resource.phone ? (
    <a
      href={`tel:${resource.phone.replace(/[^0-9+]/g, "")}`}
      className="text-accent hover:underline"
    >
      📞 {resource.phone}
    </a>
  ) : (
    <span className="text-text-subtle italic">
      Phone not provided
    </span>
  )}
</p>


{/* Address */}
{resource.address || resource.city || resource.state || resource.zip ? (
  <p>
    📍{" "}
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [resource.address, resource.city, resource.state, resource.zip]
          .filter(Boolean)
          .join(" ")
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent hover:underline"
    >
      <span className="text-text-primary">
        {resource.address && `${resource.address} `}
        {[resource.city, resource.state, resource.zip]
          .filter(Boolean)
          .join(", ")}
      </span>
    </a>
  </p>
) : (
  <p className="text-text-subtle italic">
    Address not provided
  </p>
)}

{/* Application Link */}
{resource.application_link && (
  <p>
    📝{" "}
    <a
      href={
        resource.application_link.startsWith("http")
          ? resource.application_link
          : `https://${resource.application_link}`
      }
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent hover:underline"
    >
      Apply Here
    </a>
  </p>
)}

      {resource.website ? (
  <p>
    🌐{" "}
    <a
      href={
        resource.website.startsWith("http")
          ? resource.website
          : `https://${resource.website}`
      }
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent hover:underline"
    >
      {formatWebsite(resource.website)}
    </a>
  </p>
) : (
        <p className="text-text-subtle italic">
          Website not available
        </p>
      )}

    </div>
  </div>

  <div className="border-b border-border mb-8" />






  {/* ---------------- Description ---------------- */}
  <div className="mb-6 md:mb-10 max-w-3xl">

    <div className="text-text-primary leading-relaxed space-y-4">
      {resource.description ? (
        resource.description.split("\n").map(
          (paragraph: string, index: number) => (
            <p key={index}>{paragraph}</p>
          )
        )
      ) : (
        <p className="text-text-subtle italic">
          Description not yet provided.
        </p>
      )}
    </div>

  </div>

  <div className="border-b border-border mb-8" />

  {/* ---------------- Services ---------------- */}
  <div className="mb-4 md:mb-8">

    <h2 className="text-xl font-semibold mb-2 md:mb-4">
      Services
    </h2>

    {serviceTags.length > 0 ? (
  <ul className="list-disc list-inside text-text-primary space-y-2">
    {serviceTags.map((tag: string, i: number) => (
      <li key={i}>
        {tag
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}
      </li>
    ))}
  </ul>
) : (
  <p className="text-text-subtle italic">
    Services information not yet available.
  </p>
)}

  </div>

  {/* ---------------- Eligibility ---------------- */}
  <div className="mb-6 md:mb-10">

    <h2 className="text-xl font-semibold mb-3">
      Eligibility
    </h2>

    <p className="text-text-primary leading-relaxed">
      {resource.eligibility || (
        <span className="text-text-subtle italic">
          Eligibility details not yet provided.
        </span>
      )}
    </p>

  </div>


<div className="mt-6 pt-4 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between text-xs text-text-muted gap-3">

  <p>
    See outdated or missing information?{" "}
    <Link
      href={`/suggest-resource?resource=${resource.slug}`}
      className="text-blue-400 hover:underline"
    >
      Suggest an update
    </Link>
  </p>

  <p className="md:text-right">
    {resource.last_verified
      ? `Last Verified: ${resource.last_verified}`
      : "Verification date not recorded."}
  </p>

</div>





</Container>


  );
}
