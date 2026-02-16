import Container from "@/components/ui/Container";
import Link from "next/link";


export default function AboutPage() {
  return (
    <div className="py-14">
      <Container>
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Intro */}
          <section className="space-y-3">



            <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
              Access to support should never depend on insider knowledge.
            </h1>

            <p className="text-zinc-300 leading-relaxed">
              War Party Resources is a community-informed directory built to
              simplify how individuals and families find essential services.
              While open to the public, it is intentionally centered on Native
              communities.
            </p>
          </section>

          {/* Why */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              Why It Exists
            </h2>

            <p className="text-zinc-300 leading-relaxed">
              Services are often fragmented, outdated, or difficult to access.
              This platform brings clarity and organization into one place —
              reducing barriers and making it easier to take the next step.
            </p>
          </section>

{/* Values - Community & Warm */}
<section className="space-y-6">

  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
    <h3 className="text-lg font-semibold mb-2">
      Built for Community
    </h3>
    <p className="text-zinc-300 text-sm leading-relaxed">
      This directory grows through shared knowledge and lived experience.
      Community members suggest resources, share what’s working, and help
      ensure the information reflects real needs — not just formal listings.
      It’s shaped by the people it serves.
    </p>
  </div>

  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
    <h3 className="text-lg font-semibold mb-2">
      Designed for Clarity
    </h3>
    <p className="text-zinc-300 text-sm leading-relaxed">
      Finding support shouldn’t feel confusing or overwhelming.
      Services are organized in a way that feels simple, respectful,
      and practical — helping individuals and families move forward
      with confidence.
    </p>
  </div>

  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
    <h3 className="text-lg font-semibold mb-2">
      Maintained with Integrity
    </h3>
    <p className="text-zinc-300 text-sm leading-relaxed">
      Every resource is reviewed before being published.
      Information is updated with care so that what’s listed here
      remains trustworthy, accurate, and aligned with the community’s
      well-being.
    </p>
  </div>

<div className="pt-6 border-t border-zinc-800 text-center">
  <Link
    href="/"
    className="text-sm text-zinc-400 hover:text-white transition"
  >
    ← Back to Home
  </Link>
</div>



</section>





        </div>
      </Container>
    </div>
  );
}
