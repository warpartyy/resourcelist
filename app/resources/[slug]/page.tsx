import { getSupabase } from "@/lib/supabase";
import Container from "../../../components/ui/Container";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = getSupabase(); // 👈 add this

  const { slug } = await params;

  const { data: resource, error } = await supabase
    .from("resources")
    .select("*")
    .eq("slug", slug)
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

  return (
<Container>

  {/* Back Link */}
  {primaryCategory && displayCategory && (
    <div className="mb-4">
      <Link
        href={`/${primaryCategory}`}
        className="text-sm text-blue-400 hover:underline"
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

    <div className="space-y-2 text-sm text-zinc-400">

<p>
  {resource.phone ? (
    <a
      href={`tel:${resource.phone.replace(/[^0-9+]/g, "")}`}
      className="text-blue-400 hover:underline"
    >
      📞 {resource.phone}
    </a>
  ) : (
    <span className="text-zinc-500 italic">
      Phone not provided
    </span>
  )}
</p>


<p>
  {resource.phone ? (
    <a
      href={`tel:${resource.phone.replace(/[^0-9+]/g, "")}`}
      className="text-blue-400 hover:underline"
    >
      📞 {resource.phone}
    </a>
  ) : (
    <span className="text-zinc-500 italic">
      Phone not provided
    </span>
  )}
</p>



      {resource.website ? (
        <p>
          🌐{" "}
          <a
            href={resource.website}
            target="_blank"
            className="text-blue-400 hover:underline"
          >
            {resource.website}
          </a>
        </p>
      ) : (
        <p className="text-zinc-500 italic">
          Website not available
        </p>
      )}

    </div>
  </div>

  <div className="border-b border-zinc-800 mb-8" />

  {/* ---------------- Description ---------------- */}
  <div className="mb-6 md:mb-10 max-w-3xl">

    <div className="text-zinc-300 leading-relaxed space-y-4">
      {resource.description ? (
        resource.description.split("\n").map(
          (paragraph: string, index: number) => (
            <p key={index}>{paragraph}</p>
          )
        )
      ) : (
        <p className="text-zinc-500 italic">
          Description not yet provided.
        </p>
      )}
    </div>

  </div>

  <div className="border-b border-zinc-800 mb-8" />

  {/* ---------------- Services ---------------- */}
  <div className="mb-4 md:mb-8">

    <h2 className="text-xl font-semibold mb-2 md:mb-4">
      Services
    </h2>

    {resource.services?.length > 0 ? (
      <ul className="list-disc list-inside text-zinc-300 space-y-2">
        {resource.services.map((service: string, i: number) => (
          <li key={i}>{service}</li>
        ))}
      </ul>
    ) : (
      <p className="text-zinc-500 italic">
        Services information not yet available.
      </p>
    )}

  </div>

  {/* ---------------- Eligibility ---------------- */}
  <div className="mb-6 md:mb-10">

    <h2 className="text-xl font-semibold mb-3">
      Eligibility
    </h2>

    <p className="text-zinc-300 leading-relaxed">
      {resource.eligibility || (
        <span className="text-zinc-500 italic">
          Eligibility details not yet provided.
        </span>
      )}
    </p>

  </div>


<div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between text-xs text-zinc-600 gap-3">

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
