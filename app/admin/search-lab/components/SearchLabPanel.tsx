"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  searchResources,
  type ResourceSearchResponse,
} from "@/lib/services/resources/intelligence/searchEngine";
import type { ResourceRow } from "@/lib/services/resources/intelligence/types";
import SearchLabStats from "./SearchLabStats";
import SearchLabSummary from "./SearchLabSummary";
import SearchResultCard from "./SearchResultCard";

const DEFAULT_QUERY = "I'm looking for a hospital in Lawton";

export default function SearchLabPanel({ resources }: { resources: ResourceRow[] }) {
  const [query, setQuery] = useState(DEFAULT_QUERY);

  const output: ResourceSearchResponse = useMemo(
    () =>
      searchResources({
        query,
        resources,
      }),
    [query, resources]
  );

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
        candidateSelection={output.candidateSelection}
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
