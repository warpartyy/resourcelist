"use client";
import { TRIBES } from "@/lib/tribes";
import TribeSelect from "./TribeSelect";

type Props = {
  errors: {
    organization?: string;
    email?: string;
  };
  organizationRef: React.RefObject<HTMLInputElement | null>;
  emailRef: React.RefObject<HTMLInputElement | null>;
  isTribal: boolean;
  setIsTribal: (val: boolean) => void;
  tribe: string;
  setTribe: (val: string) => void;
};

export default function BasicInfoSection({
  errors,
  organizationRef,
  emailRef,
  isTribal,
  setIsTribal,
  tribe,        // ✅ ADD THIS
  setTribe,     // ✅ ADD THIS
}: Props) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          Basic Information
        </h2>
        <p className="text-sm text-text-muted">
          Tell us about the organization, where it’s located, and how to contact them.
        </p>
      </div>

      {/* Organization */}
      <div>
        <input
          ref={organizationRef}
          name="organization"
          placeholder="Organization Name"
          className={`w-full rounded-lg p-3 border ${
            errors.organization
              ? "border-red-500 bg-red-500/10"
              : "border-border bg-bg text-text-primary"
          }`}
        />
        {errors.organization && (
          <p className="text-red-400 text-sm mt-1">
            {errors.organization}
          </p>
        )}
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        <input
          name="phone"
          placeholder="Phone"
          className="bg-bg border border-border rounded-lg p-3 text-text-primary"
        />

        <input
          ref={emailRef}
          name="email"
          placeholder="Email"
          className={`rounded-lg p-3 border ${
            errors.email
              ? "border-red-500 bg-red-500/10"
              : "border-border bg-bg text-text-primary"
          }`}
        />

        <input
          name="website"
          placeholder="Website"
          className="md:col-span-2 bg-bg border border-border rounded-lg p-3 text-text-primary"
        />
      </div>

      {/* Email error */}
      {errors.email && (
        <p className="text-red-400 text-sm mt-1">
          {errors.email}
        </p>
      )}

      {/* Location */}
      <div className="pt-4 border-t border-border space-y-3">

        <input
          name="address"
          placeholder="Street Address"
          className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            name="city"
            placeholder="City"
            className="bg-bg border border-border rounded-lg p-3 text-text-primary"
          />

          <input
            name="state"
            placeholder="State (e.g. OK)"
            className="bg-bg border border-border rounded-lg p-3 text-text-primary"
          />

          <input
            name="zip"
            placeholder="ZIP Code"
            className="bg-bg border border-border rounded-lg p-3 text-text-primary"
          />
        </div>
      </div>

      {/* Tribal Program */}
      <div className="pt-4 border-t border-border space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">

          {/* Hidden checkbox */}
          <input
            type="checkbox"
            name="is_tribal"
            checked={isTribal}
            onChange={(e) => setIsTribal(e.target.checked)}
            className="sr-only"
          />

          {/* Custom checkbox */}
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
              isTribal
                ? "bg-accent/20 border-accent"
                : "border-border bg-bg group-hover:border-accent"
            }`}
          >
            {isTribal && (
              <span className="text-accent text-xs font-bold">
                ✓
              </span>
            )}
          </div>

          <span className="text-sm text-text-primary">
            This is a tribal program
          </span>
        </label>

        {/* Conditional tribe input */}
{isTribal && (
  <>
    <TribeSelect value={tribe} onChange={setTribe} />

    {/* Hidden input so FormData still works */}
    <input type="hidden" name="tribe" value={tribe} />
  </>
)}
      </div>

    </div>
  );
}