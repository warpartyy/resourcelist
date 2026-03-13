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
              About
            </h1>

            <p className="text-text-primary leading-relaxed">
              War Party Resources grew out of firsthand experience working 
              within public health and community support systems. Over time, 
              it became clear how difficult it can be to navigate services — 
              even for those familiar with the system. Information is often 
              scattered, inconsistent, or difficult to verify. For individuals 
              and families seeking support, that complexity can slow down access 
              at the moment it’s needed most. This directory was created to make 
              that process more straightforward. While publicly available, it is 
              intentionally centered on Native individuals and families.
            </p>
          </section>

          {/* Why */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              Why It Exists
            </h2>

            <p className="text-text-primary leading-relaxed">
              Accessing essential services shouldn’t require insider knowledge 
              or repeated referrals just to find a starting point. This platform 
              brings relevant resources into one place — organized clearly and 
              reviewed with care — to help reduce confusion and make it easier 
              to take the next step.


            </p>
          </section>

{/* Values - Community & Warm */}
<section className="space-y-6">

  <div className="bg-surface border border-border rounded-xl p-5">
    <h3 className="text-lg font-semibold mb-2">
      How It’s Built
    </h3>
    <p className="text-text-primary text-sm leading-relaxed">
      This directory is shaped by direct experience within public health and 
      community support systems, along with community contributions from across
      different regions. Resources are identified through professional familiarity 
      with service networks and referral pathways — and strengthened by people who 
      know what is actually available in their communities. Anyone can suggest a 
      resource. Every submission is reviewed before publication. Community knowledge 
      expands it. Experience helps guide it.
    </p>
  </div>

  <div className="bg-surface border border-border rounded-xl p-5">
    <h3 className="text-lg font-semibold mb-2">
      What It Prioritizes
    </h3>
    <p className="text-text-primary text-sm leading-relaxed">
      Clarity over complexity.
      Access over bureaucracy.
      Respect over gatekeeping.
      
      Information is organized to be practical, transparent, 
      and easy to navigate — without unnecessary barriers or institutional language.
    </p>
  </div>

  <div className="bg-surface border border-border rounded-xl p-5">
    <h3 className="text-lg font-semibold mb-2">
      Ongoing Care
    </h3>
    <p className="text-text-primary text-sm leading-relaxed">
      Every listing is reviewed before it is published. Updates can be 
      submitted when information changes. The directory evolves over time 
      to remain accurate and relevant.
      
      This is not a campaign.
      It’s infrastructure.
    </p>
  </div>

<div className="pt-6 border-t border-border text-center">
  <Link
    href="/"
    className="text-sm text-text-muted hover:text-text-primary transition"
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
