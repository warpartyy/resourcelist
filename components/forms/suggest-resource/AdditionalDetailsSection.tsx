"use client";

export default function AdditionalDetailsSection() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          Additional Details
        </h2>
        <p className="text-sm text-text-muted">
          Help others understand what this organization provides.
        </p>
      </div>

      {/* Description */}
      <textarea
        name="description"
        placeholder="Description"
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
      />

      {/* Services */}
      <input
        name="services"
        placeholder="Services (comma separated)"
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
      />

      {/* Eligibility */}
      <input
        name="eligibility"
        placeholder="Eligibility"
        className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
      />

    </div>
  );
}