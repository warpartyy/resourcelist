import Container from "@/components/ui/Container";

export default function HowItWorksPage() {
  return (
    <Container>

      <h1 className="text-4xl font-semibold tracking-tight mb-6">
        How It Works
      </h1>

      <p className="text-zinc-400 max-w-3xl mb-10">
        War Party Resources is built through shared knowledge and maintained
        with care. Every listing is reviewed before publication to ensure
        clarity, accuracy, and community relevance.
      </p>

      <div className="space-y-12">

        {/* Community Contributions */}
        <section>
          <h2 className="text-xl font-semibold mb-3">
            Community Contributions
          </h2>

          <p className="text-zinc-300 leading-relaxed max-w-3xl">
            Anyone can suggest a resource. Submissions may include service
            details, contact information, eligibility criteria, and location.
            Community input helps expand access to essential support.
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
