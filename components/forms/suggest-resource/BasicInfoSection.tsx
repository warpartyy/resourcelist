"use client";

import TribeSelect from "./TribeSelect";

type BasicInfoDefaults = {
  organization?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
};

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
  defaultValues?: BasicInfoDefaults;
};

export default function BasicInfoSection({
  errors,
  organizationRef,
  emailRef,
  isTribal,
  setIsTribal,
  tribe,
  setTribe,
  defaultValues,
}: Props) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          Basic Information
        </h2>
        <p className="text-sm text-text-muted">
          Tell us about the organization, where it is located, and how to contact them.
        </p>
      </div>

      <div>
        <input
          ref={organizationRef}
          name="organization"
          placeholder="Organization Name"
          defaultValue={defaultValues?.organization ?? ""}
          className={`w-full rounded-lg p-3 border ${
            errors.organization
              ? "border-red-500 bg-red-500/10"
              : "border-border bg-bg text-text-primary"
          }`}
        />
        {errors.organization ? (
          <p className="text-red-400 text-sm mt-1">{errors.organization}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          name="phone"
          placeholder="Phone"
          defaultValue={defaultValues?.phone ?? ""}
          className="bg-bg border border-border rounded-lg p-3 text-text-primary"
        />

        <input
          ref={emailRef}
          name="email"
          placeholder="Email"
          defaultValue={defaultValues?.email ?? ""}
          className={`rounded-lg p-3 border ${
            errors.email
              ? "border-red-500 bg-red-500/10"
              : "border-border bg-bg text-text-primary"
          }`}
        />

        <input
          name="website"
          placeholder="Website"
          defaultValue={defaultValues?.website ?? ""}
          className="md:col-span-2 bg-bg border border-border rounded-lg p-3 text-text-primary"
        />
      </div>

      {errors.email ? (
        <p className="text-red-400 text-sm mt-1">{errors.email}</p>
      ) : null}

      <div className="pt-4 border-t border-border space-y-3">
        <input
          name="address"
          placeholder="Street Address"
          defaultValue={defaultValues?.address ?? ""}
          className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            name="city"
            placeholder="City"
            defaultValue={defaultValues?.city ?? ""}
            className="bg-bg border border-border rounded-lg p-3 text-text-primary"
          />

          <input
            name="state"
            placeholder="State (e.g. OK)"
            defaultValue={defaultValues?.state ?? ""}
            className="bg-bg border border-border rounded-lg p-3 text-text-primary"
          />

          <input
            name="zip"
            placeholder="ZIP Code"
            defaultValue={defaultValues?.zip ?? ""}
            className="bg-bg border border-border rounded-lg p-3 text-text-primary"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="is_tribal"
            checked={isTribal}
            onChange={(e) => setIsTribal(e.target.checked)}
            className="sr-only"
          />

          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
              isTribal
                ? "bg-accent/20 border-accent"
                : "border-border bg-bg group-hover:border-accent"
            }`}
          >
            {isTribal ? (
              <span className="text-accent text-xs font-bold">x</span>
            ) : null}
          </div>

          <span className="text-sm text-text-primary">
            This is a tribal program
          </span>
        </label>

        {isTribal ? (
          <>
            <TribeSelect value={tribe} onChange={setTribe} />
            <input type="hidden" name="tribe" value={tribe} />
          </>
        ) : null}
      </div>
    </div>
  );
}
