import { PARENT_CATEGORIES, SUBCATEGORIES, SUBCATEGORY_PARENT_MAP } from "@/lib/taxonomy";
import type React from "react";
import type {
  ResourceDiscoveryResearchRequest,
  ResourceDiscoverySearchScope,
} from "@/lib/services/admin/resource-discovery/types";

type DiscoveryWorkspaceProps = {
  research: ResourceDiscoveryResearchRequest;
  isResearching: boolean;
  onChange: (research: ResourceDiscoveryResearchRequest) => void;
  onSubmit: () => void;
};

const SEARCH_SCOPES: ResourceDiscoverySearchScope[] = [
  "Local",
  "Nearby",
  "Statewide",
];

export default function DiscoveryWorkspace({
  research,
  isResearching,
  onChange,
  onSubmit,
}: DiscoveryWorkspaceProps) {
  const subcategories = SUBCATEGORIES.filter(
    (subcategory) => SUBCATEGORY_PARENT_MAP[subcategory.value] === research.parentCategory,
  );
  const canSubmit = Boolean(research.parentCategory && research.state.trim());

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          Research Workspace
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Choose one focused research task. AI research runs only when you click
          Research Organizations.
        </p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Parent Category" required>
          <select
            value={research.parentCategory}
            onChange={(event) =>
              onChange({
                ...research,
                parentCategory: event.target.value,
                subcategory: "",
              })
            }
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            <option value="">Select a category</option>
            {PARENT_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Subcategory">
          <select
            value={research.subcategory ?? ""}
            onChange={(event) =>
              onChange({ ...research, subcategory: event.target.value })
            }
            disabled={!research.parentCategory}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm disabled:opacity-60"
          >
            <option value="">Any subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.value} value={subcategory.value}>
                {subcategory.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="State" required>
          <input
            value={research.state}
            onChange={(event) => onChange({ ...research, state: event.target.value })}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            placeholder="Oklahoma"
          />
        </Field>

        <Field label="County">
          <input
            value={research.county ?? ""}
            onChange={(event) => onChange({ ...research, county: event.target.value })}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            placeholder="Comanche"
          />
        </Field>

        <Field label="City">
          <input
            value={research.city ?? ""}
            onChange={(event) => onChange({ ...research, city: event.target.value })}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            placeholder="Lawton"
          />
        </Field>

        <Field label="Search Scope">
          <select
            value={research.scope}
            onChange={(event) =>
              onChange({
                ...research,
                scope: event.target.value as ResourceDiscoverySearchScope,
              })
            }
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          >
            {SEARCH_SCOPES.map((scope) => (
              <option key={scope} value={scope}>
                {scope}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Optional Keywords">
          <input
            value={research.keywords ?? ""}
            onChange={(event) => onChange({ ...research, keywords: event.target.value })}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            placeholder="Veterans, youth, telehealth"
          />
        </Field>

        <Field label="Maximum Results">
          <input
            type="number"
            min={1}
            max={5}
            value={research.maximumResults}
            onChange={(event) =>
              onChange({
                ...research,
                maximumResults: clampMaximumResults(Number(event.target.value)),
              })
            }
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isResearching}
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResearching ? "Researching..." : "Research Organizations"}
        </button>
      </div>
    </section>
  );
}

function clampMaximumResults(value: number) {
  if (Number.isNaN(value)) {
    return 5;
  }

  return Math.min(5, Math.max(1, Math.round(value)));
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
        {required ? " *" : ""}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
