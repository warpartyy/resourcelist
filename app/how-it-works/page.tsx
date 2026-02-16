import Container from "@/components/ui/Container";

export default function HowItWorksPage() {
  return (
    <Container>

      <h1 className="text-4xl font-semibold tracking-tight pt-8 mb-2">
        How It Works
      </h1>

      <p className="text-zinc-300 max-w-3xl mb-10">
        War Party Resources is built through shared knowledge and maintained
        with care. Every listing is reviewed before publication to ensure
        clarity, accuracy, and community relevance.
      </p>

      <div className="space-y-12">

        {/* Community Contributions */}
        <section>
          <h2 className="text-xl font-semibold mb-3">
            Curated with Field Experience
          </h2>



<p className="text-zinc-300 leading-relaxed max-w-3xl">
  This directory is informed by professional experience working within
  public health and community support systems.
  In addition to community submissions, resources are actively identified
  and added based on direct knowledge of service networks, referral pathways,
  and regional providers.
  Community input expands the directory. Professional experience helps shape
  and review it.
</p>



        </section>

        <div className="border-b border-zinc-800" />

        {/* Community Contributions */}
        <section>
          <h2 className="text-xl font-semibold mb-3">
            Community Contributions
          </h2>

          <p className="text-zinc-300 leading-relaxed max-w-3xl">
            Anyone can suggest a resource. Submissions may include service details, 
            contact information, eligibility criteria, location, and any notes that 
            help clarify how the service operates.If you’re familiar with a program 
            in your area — whether it’s tribal, urban, regional, or grassroots — your 
            input helps ensure others can find support that is relevant and accessible 
            to them. Community knowledge strengthens this directory and helps expand 
            access to essential care.
          </p>
        </section>

        <div className="border-b border-zinc-800" />

        {/* Review & Verification */}
        <section>
          <h2 className="text-xl font-semibold mb-3">
            Review & Verification
          </h2>

          <p className="text-zinc-300 leading-relaxed max-w-3xl">
            All submissions are reviewed by an administrator before being
            published. Information is checked for clarity and completeness.
            When possible, contact details and service descriptions are verified
            directly with the provider.
          </p>
        </section>

        <div className="border-b border-zinc-800" />

        {/* Ongoing Updates */}
        <section>
          <h2 className="text-xl font-semibold mb-3">
            Ongoing Updates
          </h2>

          <p className="text-zinc-300 leading-relaxed max-w-3xl">
            Resources evolve over time. If information changes or becomes
            outdated, community members can suggest updates. This directory is
            maintained as a living system, not a static list.
          </p>
        </section>

        <div className="border-b border-zinc-800" />

        {/* Commitment */}
        <section>
          <h2 className="text-xl font-semibold mb-3">
            Our Commitment
          </h2>

          <p className="text-zinc-300 leading-relaxed max-w-3xl">
            This platform is designed for clarity, dignity, and direct access.
            We aim to reduce barriers to finding support and ensure information
            is presented respectfully and transparently.
          </p>
        </section>

<div className="mt-16 text-sm text-zinc-500">
  Questions about a listing? Use the Suggest a Resource page to request an update.
</div>


      </div>

    </Container>
  );
}
