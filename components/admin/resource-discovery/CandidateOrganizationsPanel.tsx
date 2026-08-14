import type { ResourceDiscoveryCandidate } from "@/lib/services/admin/resource-discovery/types";

const DISABLED_ACTIONS = ["Dismiss"];

export default function CandidateOrganizationsPanel({
  candidates,
  hasRunResearch = false,
  isLoading = false,
  error,
  creatingCandidateKey,
  onCreatePendingResource,
}: {
  candidates: ResourceDiscoveryCandidate[];
  hasRunResearch?: boolean;
  isLoading?: boolean;
  error?: string | null;
  creatingCandidateKey?: string | null;
  onCreatePendingResource: (candidate: ResourceDiscoveryCandidate) => void | Promise<void>;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-text-primary">
        Potential Resources
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Organizations discovered for admin review. Resource Discovery only
        identifies potential organizations.
      </p>

      {isLoading ? (
        <StateBox
          title="Researching potential organizations..."
          message="One focused AI-assisted organization search is running."
        />
      ) : null}

      {error && !isLoading ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">
            Candidate discovery could not complete.
          </p>
          <p className="mt-2 text-sm text-red-700">{error}</p>
        </div>
      ) : null}

      {!isLoading && !error && !hasRunResearch ? (
        <StateBox
          title="No research session has been started."
          message="Fill out the research workspace and click Research Organizations."
        />
      ) : null}

      {!isLoading && !error && hasRunResearch && candidates.length === 0 ? (
        <StateBox
          title="No potential resources found."
          message="Only candidates with an organization name, website, and no duplicate match are shown."
        />
      ) : null}

      {!isLoading && !error && candidates.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {candidates.map((candidate) => (
            <CandidateCard
              key={`${candidate.organization}-${candidate.website ?? "none"}`}
              candidate={candidate}
              isCreating={creatingCandidateKey === getCandidateKey(candidate)}
              onCreatePendingResource={onCreatePendingResource}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function CandidateCard({
  candidate,
  isCreating,
  onCreatePendingResource,
}: {
  candidate: ResourceDiscoveryCandidate;
  isCreating: boolean;
  onCreatePendingResource: (candidate: ResourceDiscoveryCandidate) => void | Promise<void>;
}) {
  const isPending = candidate.reviewStatus === "Created";

  return (
    <article className="rounded-lg border border-border bg-bg p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-semibold text-text-primary">
            {candidate.organization}
          </h3>
          <a
            href={candidate.website}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block break-all text-sm font-medium text-teal-700 hover:text-teal-900"
          >
            {candidate.website}
          </a>
        </div>
        {candidate.reviewStatus ? (
          <Badge label={isPending ? "Pending" : candidate.reviewStatus} />
        ) : null}
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
          Reason
        </p>
        <p className="mt-1 text-sm text-text-muted">{candidate.whySuggested}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending || isCreating}
          onClick={() => onCreatePendingResource(candidate)}
          className={
            isPending
              ? "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted opacity-70"
              : "rounded-lg border border-teal-700 bg-teal-700 px-3 py-2 text-sm text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
          }
        >
          {isPending ? "Added to Pending" : isCreating ? "Adding..." : "Create Pending Resource"}
        </button>
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

function getCandidateKey(candidate: ResourceDiscoveryCandidate) {
  return candidate.id ?? `${candidate.organization}-${candidate.website ?? "none"}`;
}

function StateBox({ title, message }: { title: string; message: string }) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-border bg-bg p-4">
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <p className="mt-2 text-sm text-text-muted">{message}</p>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted">
      {label}
    </span>
  );
}
