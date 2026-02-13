import { supabase } from "../../../lib/supabase";
import Container from "../../../components/ui/Container";
import Link from "next/link";

type Resource = {
  id: string;
  slug: string;
  organization: string;
  categories: string[];
  counties_served: string[];
  phone: string;
  website: string;
  application_link: string;
  address: string;
  description: string;
  services: string[];
  eligibility: string;
  last_verified: string;
};

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: resource, error } = await supabase
    .from("resources")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !resource) {
    return (
      <Container>
        <h1 className="text-2xl font-bold">
          Resource not found.
        </h1>
      </Container>
    );
  }

  const primaryCategory = resource.categories[0];

  const displayCategory = primaryCategory
    .split("-")
    .map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");

  return (
    <Container>

      {/* Back to Category */}
      <div className="mb-6">
        <Link
          href={`/${primaryCategory}`}
          className="text-sm text-blue-400 hover:underline"
        >
          ← Back to {displayCategory}
        </Link>
      </div>

      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl mb-8">
        <h1 className="text-4xl font-bold mb-3">
          {resource.organization}
        </h1>

        <p className="text-zinc-400 mb-4">
          {resource.description}
        </p>

        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <span>
            📍 {resource.counties_served.join(", ")} County
          </span>
          <span>📞 {resource.phone}</span>
        </div>
      </div>

      {/* Two Columns */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* Left */}
        <div className="space-y-8">

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">
              Services Provided
            </h2>
            <ul className="list-disc list-inside text-zinc-300 space-y-2">
              {resource.services.map((service: string, i: number) => (
                <li key={i}>{service}</li>
              ))}
            </ul>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-3">
              Eligibility
            </h2>
            <p className="text-zinc-300">
              {resource.eligibility}
            </p>
          </div>

        </div>

        {/* Right */}
        <div className="space-y-8">

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">
              Contact Information
            </h2>

            <p className="mb-2">📞 {resource.phone}</p>
            <p className="mb-4">📍 {resource.address}</p>

            <div className="flex flex-col gap-3">
              <a
                href={resource.website}
                target="_blank"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center transition"
              >
                Visit Website
              </a>

              <a
                href={resource.application_link}
                target="_blank"
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 py-2 px-4 rounded-lg text-center transition"
              >
                Apply Now
              </a>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-3">
              Verification
            </h2>
            <p className="text-sm text-zinc-400">
              Last Verified: {resource.last_verified}
            </p>
          </div>

        </div>

      </div>
    </Container>
  );
}
