import { Fragment, useState } from "react";
import type {
  CoverageItem,
  GapLevel,
} from "@/lib/services/admin/directory-coverage/types";

const GAP_STYLES: Record<GapLevel, string> = {
  "Well Covered": "bg-emerald-50 text-emerald-800 border-emerald-200",
  Monitor: "bg-sky-50 text-sky-800 border-sky-200",
  "Growing Need": "bg-amber-50 text-amber-800 border-amber-200",
  "High Priority": "bg-orange-50 text-orange-800 border-orange-200",
  "Critical Opportunity": "bg-red-50 text-red-800 border-red-200",
};

export default function CoverageGapTable({
  opportunities,
}: {
  opportunities: CoverageItem[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">
          Recruitment Opportunities
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          Highest gap scores identify service areas where demand appears to
          exceed current directory coverage.
        </p>
      </div>

      {opportunities.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">
          No opportunity data is available yet.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="py-3 pr-4 font-semibold">Subcategory</th>
                <th className="px-3 py-3 font-semibold">Resources</th>
                <th className="px-3 py-3 font-semibold">Searches</th>
                <th className="px-3 py-3 font-semibold">Helpful Rate</th>
                <th className="px-3 py-3 font-semibold">Recommendation Rate</th>
                <th className="px-3 py-3 font-semibold">Gap Score</th>
                <th className="py-3 pl-3 font-semibold">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {opportunities.map((item) => (
                <Fragment key={item.subcategory}>
                  <tr>
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(
                            expanded === item.subcategory
                              ? null
                              : item.subcategory
                          )
                        }
                        className="text-left"
                      >
                        <p className="font-medium text-text-primary">
                          {expanded === item.subcategory ? "-" : "+"}{" "}
                          {item.subcategory}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {item.gapReasons.join(", ")}
                        </p>
                      </button>
                    </td>
                    <td className="px-3 py-3 text-text-muted">
                      {item.resourceCount}
                      <Trend value={item.trend.resourcesAdded30Days} prefix="+" />
                    </td>
                    <td className="px-3 py-3 text-text-muted">
                      {item.searchCount}
                      <Trend
                        value={item.trend.searchDemandChangePercent}
                        suffix="%"
                      />
                    </td>
                    <td className="px-3 py-3 text-text-muted">
                      {formatPercent(item.helpfulRate)}
                      <Trend
                        value={item.trend.helpfulRateChangePercent}
                        suffix="%"
                      />
                    </td>
                    <td className="px-3 py-3 text-text-muted">
                      {item.recommendationRate.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 font-semibold text-text-primary">
                      {item.gapScore}
                    </td>
                    <td className="py-3 pl-3">
                      <GapBadge level={item.gapLevel} />
                    </td>
                  </tr>
                  {expanded === item.subcategory ? (
                    <tr>
                      <td colSpan={7} className="bg-bg/60 p-4">
                        <GeographicCoverageTable item={item} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function GeographicCoverageTable({ item }: { item: CoverageItem }) {
  if (item.geographicCoverage.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        No county-level coverage data is available for this subcategory.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-text-primary">
        Geographic Coverage
      </p>
      <table className="min-w-full divide-y divide-border text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-text-muted">
            <th className="py-2 pr-3">County</th>
            <th className="px-3 py-2">Resources</th>
            <th className="px-3 py-2">Searches</th>
            <th className="px-3 py-2">Helpful Rate</th>
            <th className="px-3 py-2">Gap Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {item.geographicCoverage.map((county) => (
            <tr key={`${item.subcategory}-${county.county}`}>
              <td className="py-2 pr-3 text-text-primary">{county.county}</td>
              <td className="px-3 py-2 text-text-muted">
                {county.resourceCount}
              </td>
              <td className="px-3 py-2 text-text-muted">
                {county.searchCount}
              </td>
              <td className="px-3 py-2 text-text-muted">
                {formatPercent(county.helpfulRate)}
              </td>
              <td className="px-3 py-2">
                <span className="font-semibold text-text-primary">
                  {county.gapScore}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GapBadge({ level }: { level: GapLevel }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${GAP_STYLES[level]}`}
    >
      {level}
    </span>
  );
}

function Trend({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  if (value === 0) {
    return null;
  }

  const sign = value > 0 ? "+" : "";
  return (
    <span
      className={`ml-1 text-xs ${
        value > 0 ? "text-teal-700" : "text-red-700"
      }`}
    >
      ({prefix || sign}
      {value}
      {suffix})
    </span>
  );
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}
