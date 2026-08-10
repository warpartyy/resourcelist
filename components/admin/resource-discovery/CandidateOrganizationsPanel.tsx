import {
  ResourceDiscoveryResearchStatus,
  type ResourceDiscoveryCandidate,
} from "@/lib/services/admin/resource-discovery/types";

const DISABLED_ACTIONS = ["Collect Evidence"];
const PLACEHOLDER_CANDIDATE: ResourceDiscoveryCandidate = {
  organization: "Organization Name",
  website: "https://example.org",
  phone: "Phone",
  address: "Address",
  services: ["Services"],
  eligibility: "Eligibility",
  countiesServed: ["Counties Served"],
  tribalEligibility: "Tribal Eligibility",
  evidence: [
    {
      source: "Evidence source",
      title: "Evidence title",
      url: "Evidence URL",
      evidenceType: "official_website",
      confidence: "Low",
      verified: false,
    },
  ],
  evidenceSources: [
    {
      sourceType: "official_website",
      organization: "Organization Name",
      title: "Official Website",
      url: "https://example.org",
      collectedAt: "Future collection timestamp",
      provider: "Official Website Provider",
      providerPriority: 100,
      quality: "Low",
      lastVerified: "Not verified",
      isOfficial: true,
      isPrimarySource: true,
      verified: false,
    },
  ],
  completeness: 0,
  evidenceQuality: "Low",
  provider: "Official Website Provider",
  providerPriority: 100,
  discoverySource: "Official Website",
  matchedSearchPhrase: "Service category County State",
  alreadyInDirectory: false,
  duplicateConfidence: 0,
  nextStep: "Collect Evidence",
  isPrimarySource: true,
  lastVerified: "Not verified",
  freshness: "Unknown",
  conflicts: [],
  confidence: "Low",
  whySuggested: "Why Suggested",
  researchStatus: ResourceDiscoveryResearchStatus.ResearchPlanned,
};

export default function CandidateOrganizationsPanel({
  candidates,
}: {
  candidates: ResourceDiscoveryCandidate[];
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-text-primary">
        Discovered Organizations
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Future provider results will appear here before evidence collection.
      </p>

      {candidates.length === 0 ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-dashed border-border bg-bg p-4">
            <p className="text-sm font-medium text-text-primary">
              Organization Discovery has not yet been connected to live providers.
            </p>
            <p className="mt-2 text-sm text-text-muted">
              This placeholder shows the future candidate structure. Phase 5
              does not call OpenAI, scrape websites, search the internet,
              create resources, persist candidates, or approve anything.
            </p>
          </div>
          <CandidateCard candidate={PLACEHOLDER_CANDIDATE} isPlaceholder />
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {candidates.map((candidate) => (
            <CandidateCard
              key={`${candidate.organization}-${candidate.website ?? "none"}`}
              candidate={candidate}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CandidateCard({
  candidate,
  isPlaceholder = false,
}: {
  candidate: ResourceDiscoveryCandidate;
  isPlaceholder?: boolean;
}) {
  return (
    <article
      className={`rounded-lg border border-border bg-bg p-4 ${
        isPlaceholder ? "opacity-75" : ""
      }`}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-semibold text-text-primary">
            {candidate.organization}
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            {candidate.website ?? "Website not available"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge label={`${candidate.confidence} Confidence`} />
          <Badge label={candidate.researchStatus} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Detail label="Provider" value={candidate.provider} />
        <Detail label="Discovery Confidence" value={candidate.confidence} />
        <Detail label="Discovery Source" value={candidate.discoverySource} />
        <Detail label="Website" value={candidate.website} />
        <Detail
          label="Already in Directory"
          value={
            typeof candidate.alreadyInDirectory === "boolean"
              ? candidate.alreadyInDirectory
                ? "Yes"
                : "No"
              : undefined
          }
        />
        <Detail label="Next Step" value={candidate.nextStep} />
        <Detail
          label="Matched Search Phrase"
          value={candidate.matchedSearchPhrase}
        />
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
          Why It Appears Here
        </p>
        <p className="mt-1 text-sm text-text-muted">{candidate.whySuggested}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {DISABLED_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            disabled
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted opacity-60"
          >
            {action}
          </button>
        ))}
      </div>
    </article>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted">
      {label}
    </span>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm text-text-primary">{value || "Not collected"}</p>
    </div>
  );
}
