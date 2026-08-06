"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import {
  searchResources,
  type ResourceSearchResponse,
} from "@/lib/services/resources/intelligence/searchEngine";
import { evaluateGrounding } from "@/lib/services/resources/ai/evaluation/grounding/groundingEvaluator";
import type { GroundingEvaluationReport } from "@/lib/services/resources/ai/evaluation/grounding/types";
import { evaluateUnderstandingConfidence } from "@/lib/services/resources/ai/evaluation/understanding/confidence";
import type { UnderstandingConfidenceReport } from "@/lib/services/resources/ai/evaluation/understanding/types";
import type { AiRequestUnderstanding } from "@/lib/services/resources/ai/request-understanding/types";
import type { ResourceRow } from "@/lib/services/resources/intelligence/types";
import SearchLabStats from "./SearchLabStats";
import SearchLabSummary from "./SearchLabSummary";
import SearchResultCard from "./SearchResultCard";

const DEFAULT_QUERY = "I'm looking for a hospital in Lawton";

export default function SearchLabPanel({ resources }: { resources: ResourceRow[] }) {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [aiUnderstanding, setAiUnderstanding] =
    useState<AiRequestUnderstanding | null>(null);
  const [isAiUnderstandingLoading, setIsAiUnderstandingLoading] = useState(false);
  const [aiUnderstandingError, setAiUnderstandingError] = useState<string | null>(
    null
  );

  const output: ResourceSearchResponse = useMemo(
    () =>
      searchResources({
        query,
        resources,
      }),
    [query, resources]
  );

  const groundingEvaluation = useMemo(() => {
    if (!aiUnderstanding) {
      return null;
    }

    return evaluateGrounding({
      userMessage: query,
      deterministicUnderstanding: output.requestUnderstanding,
      aiUnderstanding,
    });
  }, [aiUnderstanding, output.requestUnderstanding, query]);

  const understandingConfidence = useMemo(() => {
    if (!aiUnderstanding || !groundingEvaluation) {
      return null;
    }

    return evaluateUnderstandingConfidence({
      deterministicUnderstanding: output.requestUnderstanding,
      aiUnderstanding,
      groundingEvaluation,
    });
  }, [aiUnderstanding, groundingEvaluation, output.requestUnderstanding]);

  const runAiUnderstanding = async () => {
    setIsAiUnderstandingLoading(true);
    setAiUnderstandingError(null);

    try {
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch("/api/admin/search-lab/request-understanding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({ message: query }),
      });

      if (!response.ok) {
        throw new Error(`AI understanding request failed: ${response.status}`);
      }

      const payload = (await response.json()) as {
        understanding: AiRequestUnderstanding;
      };
      setAiUnderstanding(payload.understanding);
    } catch (error) {
      setAiUnderstanding(null);
      setAiUnderstandingError(
        error instanceof Error ? error.message : "Unable to extract AI understanding"
      );
    } finally {
      setIsAiUnderstandingLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Search Lab</h1>
            <p className="mt-1 text-sm text-text-muted">
              Inspect deterministic Resource Intelligence Engine output against approved resource data.
            </p>
          </div>
          <div className="rounded-full border border-border bg-bg px-3 py-1 text-xs font-medium text-text-muted">
            Approved resources: {resources.length}
          </div>
        </div>

        <label
          htmlFor="search-lab-query"
          className="mt-5 block text-sm font-medium text-text-primary"
        >
          Query
        </label>
        <textarea
          id="search-lab-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          rows={4}
          className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void runAiUnderstanding()}
            disabled={isAiUnderstandingLoading || !query.trim()}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAiUnderstandingLoading
              ? "Extracting AI Understanding..."
              : "Run AI Understanding"}
          </button>
          <p className="text-xs text-text-muted">
            Optional debug only. Does not change ranked results.
          </p>
        </div>
      </section>

      <SearchLabStats totalResources={resources.length} results={output.results} />

      {resources.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
          No approved resources were found. The Search Lab needs approved resource records before it can rank live data.
        </div>
      ) : null}

      <SearchLabSummary
        normalizedQuery={output.normalizedQuery}
        detectedNeeds={output.detectedNeeds}
        expandedTerms={output.expandedTerms}
        requestUnderstanding={output.requestUnderstanding}
        candidateSelection={output.candidateSelection}
      />

      <AiUnderstandingDebugPanel
        understanding={aiUnderstanding}
        error={aiUnderstandingError}
      />

      <GroundingEvaluationPanel
        report={groundingEvaluation}
        confidence={understandingConfidence}
      />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Search size={18} className="text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">
            Ranked resources
          </h2>
        </div>

        {resources.length > 0 && output.results.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
            No strong matches were found for this query.
          </div>
        ) : resources.length > 0 ? (
          <div className="space-y-4">
            {output.results.map((result, index) => (
              <SearchResultCard
                key={result.resource.id}
                result={result}
                rank={index + 1}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function GroundingEvaluationPanel({
  report,
  confidence,
}: {
  report: GroundingEvaluationReport | null;
  confidence: UnderstandingConfidenceReport | null;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <div>
        <h2 className="text-sm font-semibold text-text-primary">
          Grounding Evaluation
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          Admin-only comparison of deterministic and AI request understanding.
          This does not affect production search.
        </p>
      </div>

      {!report ? (
        <p className="mt-3 text-sm text-text-muted">
          Run AI Understanding to evaluate agreement and grounding quality.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {confidence ? (
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
              <h3 className="text-sm font-semibold text-teal-900">
                Understanding Confidence
              </h3>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <DebugBlock label="Score" value={`${confidence.score}%`} />
                <DebugBlock label="Level" value={confidence.level} />
                <DebugBlock
                  label="Clarification Needed"
                  value={confidence.requiresClarification ? "Yes" : "No"}
                />
              </div>
              <DebugReasonList reasons={confidence.reasons} />
              <p className="mt-3 text-xs text-teal-900/70">
                Clarification recommendation is informational only and does not
                change current Resource Guide behavior.
              </p>
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-4">
            <DebugBlock
              label="Agreement"
              value={`${Math.round(report.agreementScore * 100)}%`}
            />
            <DebugBlock
              label="Grounding Quality"
              value={formatLabel(report.groundingQuality)}
            />
            <DebugBlock
              label="Unsupported Claims"
              value={String(report.unsupportedClaims.length)}
            />
            <DebugBlock
              label="Recommendation"
              value={report.recommendation}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <DebugList
              label="Additional Useful Context"
              items={report.additionalUsefulContext}
            />
            <DebugList label="Missing Context" items={report.missingContext} />
            <DebugList
              label="Intent Differences"
              items={formatDifferences(report.intentAgreement.differences)}
            />
            <DebugList
              label="Geography Differences"
              items={formatDifferences(report.geographyAgreement.differences)}
            />
            <DebugList
              label="Situation Differences"
              items={[
                ...report.situationAgreement.missingSituations.map(
                  (situation) => `Missing: ${situation}`
                ),
                ...report.situationAgreement.additionalSituations.map(
                  (situation) => `Additional: ${situation}`
                ),
              ]}
            />
            <DebugList
              label="Unsupported Claims"
              items={report.unsupportedClaims.map(
                (claim) => `${claim.field}: ${claim.value} (${claim.reason})`
              )}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function DebugReasonList({
  reasons,
}: {
  reasons: UnderstandingConfidenceReport["reasons"];
}) {
  return (
    <div className="mt-3 rounded-md border border-teal-200 bg-white p-3">
      <p className="text-xs font-medium text-teal-900">Reasons</p>
      <ul className="mt-2 space-y-2">
        {reasons.map((reason) => (
          <li
            key={`${reason.type}-${reason.message}`}
            className="flex gap-2 text-sm text-teal-950"
          >
            <span
              className={
                reason.type === "positive"
                  ? "font-semibold text-teal-700"
                  : reason.type === "warning"
                    ? "font-semibold text-amber-700"
                    : "font-semibold text-red-700"
              }
            >
              {reason.type === "positive"
                ? "OK"
                : reason.type === "warning"
                  ? "Review"
                  : "Risk"}
            </span>
            <span>{reason.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AiUnderstandingDebugPanel({
  understanding,
  error,
}: {
  understanding: AiRequestUnderstanding | null;
  error: string | null;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <div>
        <h2 className="text-sm font-semibold text-text-primary">
          AI Understanding
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          Structured extraction only. Search results are still deterministic.
        </p>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {!understanding && !error ? (
        <p className="mt-3 text-sm text-text-muted">
          Run AI Understanding to compare AI extraction with deterministic understanding.
        </p>
      ) : null}

      {understanding ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <DebugBlock label="Primary Need" value={understanding.primaryNeed ?? "None"} />
          <DebugBlock label="Urgency" value={understanding.urgency} />
          <DebugBlock
            label="Confidence"
            value={understanding.confidence.toFixed(2)}
          />
          <DebugList label="Secondary Needs" items={understanding.secondaryNeeds} />
          <DebugList label="Situations" items={understanding.situations} />
          <DebugList
            label="Eligibility Clues"
            items={formatEligibilityClues(understanding)}
          />
          <DebugList
            label="Location"
            items={[
              understanding.location.city
                ? `City: ${understanding.location.city}`
                : null,
              understanding.location.county
                ? `County: ${understanding.location.county}`
                : null,
              understanding.location.state
                ? `State: ${understanding.location.state}`
                : null,
            ].filter((item): item is string => Boolean(item))}
          />
        </div>
      ) : null}
    </section>
  );
}

function formatDifferences(
  differences: GroundingEvaluationReport["intentAgreement"]["differences"]
): string[] {
  return differences.map(
    (difference) =>
      `${difference.field}: deterministic ${formatValue(
        difference.deterministicValue
      )}, AI ${formatValue(difference.aiValue)}`
  );
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatValue(value: string | string[] | null) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "None";
  }

  return value ?? "None";
}

function DebugBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-bg p-3">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function DebugList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-md border border-border bg-bg p-3">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">None</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-surface px-2 py-1 text-xs text-text-muted"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function formatEligibilityClues(understanding: AiRequestUnderstanding): string[] {
  return [
    understanding.eligibilityClues.tribalAffiliation
      ? `Tribal affiliation: ${understanding.eligibilityClues.tribalAffiliation}`
      : null,
    typeof understanding.eligibilityClues.veteran === "boolean"
      ? `Veteran: ${understanding.eligibilityClues.veteran ? "Yes" : "No"}`
      : null,
    typeof understanding.eligibilityClues.pregnancy === "boolean"
      ? `Pregnancy: ${understanding.eligibilityClues.pregnancy ? "Yes" : "No"}`
      : null,
    typeof understanding.eligibilityClues.returningCitizen === "boolean"
      ? `Returning citizen: ${
          understanding.eligibilityClues.returningCitizen ? "Yes" : "No"
        }`
      : null,
  ].filter((item): item is string => Boolean(item));
}
