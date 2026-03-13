"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import Container from "../../components/ui/Container";
import { PARENT_CATEGORIES, SUBCATEGORIES, SUBCATEGORY_PARENT_MAP} from "@/lib/taxonomy";
import { useSearchParams } from "next/navigation";
import { useRef } from "react";


export default function SuggestResourcePage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ organization?: string; subcategories?: string;}>({});

  const searchParams = useSearchParams();
  const existingSlug = searchParams.get("resource");

  const organizationRef = useRef<HTMLInputElement | null>(null);
  const subcategoryRef = useRef<HTMLDivElement | null>(null);

const fieldRefs: Record<string, React.RefObject<HTMLElement>> = {
  organization: organizationRef as React.RefObject<HTMLElement>,
  subcategories: subcategoryRef as React.RefObject<HTMLElement>,
};




  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
const organizationName = formData.get("organization")?.toString().trim();

let newErrors: {
  organization?: string;
  subcategories?: string;
} = {};

if (!organizationName) {
  newErrors.organization = "Organization name is required.";
}

if (!selectedSubcategories.length) {
  newErrors.subcategories = "Please select at least one service type.";
}


if (Object.keys(newErrors).length > 0) {
  setErrors(newErrors);
  setLoading(false);

  const firstErrorField = Object.keys(newErrors)[0];
  const ref = fieldRefs[firstErrorField];

  if (ref?.current) {
    ref.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    if ("focus" in ref.current) {
      (ref.current as HTMLElement).focus();
    }
  }

  return;
}



setErrors({});


const newSubmission = {
  organization: organizationName,
  subcategories: selectedSubcategories,
  tags: [],
  counties_served: formData.get("counties")
    ? formData.get("counties")!.toString().split(",").map((c) => c.trim())
    : [],
  phone: formData.get("phone")?.toString() || null,
  website: formData.get("website")?.toString() || null,
address: formData.get("address")?.toString() || null,
city: formData.get("city")?.toString() || null,
state: formData.get("state")?.toString() || null,
zip: formData.get("zip")?.toString() || null,

  description: formData.get("description")?.toString() || null,
  services: formData.get("services")
    ? formData.get("services")!.toString().split(",").map((s) => s.trim())
    : [],
  eligibility: formData.get("eligibility")?.toString() || null,
  status: "pending",
};



console.log("Submitting:", newSubmission);

const supabase = getSupabase();

const response = await supabase
  .from("resource_submissions")
  .insert([newSubmission]);



console.log("Full response:", JSON.stringify(response, null, 2));




if (response.error) {
  console.error("Submission error:", JSON.stringify(response.error, null, 2));
  alert("Error submitting form. Check console.");
} else {
  setSubmitted(true);
}

    setLoading(false);
  };

if (submitted) {
  return (
    <Container>
      <h1 className="text-3xl font-bold mb-4">
        Submission Received
      </h1>

      <p className="text-text-muted mb-6">
        Thank you for suggesting a resource.
        It will be reviewed before being published.
      </p>

      <button
        onClick={() => {
          setSubmitted(false);
          setSelectedSubcategories([]);
        }}
        className="bg-accent hover:brightness-110 text-text-primary px-6 py-3 rounded-lg transition"
      >
        Suggest Another Resource
      </button>
    </Container>
  );
}



return (
  <Container>
    <h1 className="text-4xl font-bold mb-8">
      Suggest a Resource
    </h1>

<form
  onSubmit={handleSubmit}
  className="space-y-6 max-w-3xl pb-8 md:pb-12"
>


      {/* ---------------- Basic Information ---------------- */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            Basic Information
          </h2>
          <p className="text-sm text-text-muted">
            Tell us the name of the organization.
          </p>
        </div>

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
      </div>


      {/* ---------------- Services & Categories ---------------- */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            Services & Categories
          </h2>
          <p className="text-sm text-text-muted">
            Select all service types that apply.
          </p>
        </div>

        {errors.subcategories && (
          <p className="text-red-400 text-sm">
            {errors.subcategories}
          </p>
        )}

        <div
        ref={subcategoryRef}
          className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
            errors.subcategories ? "border border-red-500 p-3 rounded-lg" : ""
          }`}
        >
          {SUBCATEGORIES.map((sub) => {
            const isSelected = selectedSubcategories.includes(sub.value);

            return (

              
              <button
  type="button"
  key={sub.value}
  onClick={() => {
    if (isSelected) {
      setSelectedSubcategories((prev) =>
        prev.filter((val) => val !== sub.value)
      );
    } else {
      setSelectedSubcategories((prev) => [...prev, sub.value]);
    }
  }}
  className={`p-3 rounded-lg border transition text-left ${
    isSelected ? "shadow-md" : "bg-bg border-border text-text-muted hover:border-accent"
  }`}
  style={
    isSelected
      ? {
          background: "var(--color-accent)",
          borderColor: "var(--color-accent)",
          color: "white",
        }
      : undefined
  }
>
  {sub.label}
</button>
            );
          })}
        </div>
      </div>


      {/* ---------------- Contact Information ---------------- */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            Contact Information
          </h2>
          <p className="text-sm text-text-muted">
            How can someone get in touch?
          </p>
        </div>

        <input
          name="phone"
          placeholder="Phone"
          className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
        />

        <input
          name="website"
          placeholder="Website"
          className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
        />
      </div>


      {/* ---------------- Location (Optional) ---------------- */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            Location (Optional)
          </h2>
          <p className="text-sm text-text-muted">
            If known, provide the physical location.
          </p>
        </div>

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


      {/* ---------------- Additional Details ---------------- */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            Additional Details
          </h2>
          <p className="text-sm text-text-muted">
            Help others understand what this organization provides.
          </p>
        </div>

        <textarea
          name="description"
          placeholder="Description"
          className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
        />

        <input
          name="services"
          placeholder="Services (comma separated)"
          className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
        />

        <input
          name="eligibility"
          placeholder="Eligibility"
          className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
        />
      </div>


      {/* ---------------- Submit Button ---------------- */}
<div className="flex justify-center pt-0">
  <button
    type="submit"
    disabled={loading}
    className="button button-primary flex items-center gap-2"
  >
    {loading && (
      <span className="h-4 w-4 border-2 border-text-muted/40 border-t-text-primary rounded-full animate-spin" />
    )}
    {loading ? "Submitting..." : "Submit for Review"}
  </button>
</div>


    </form>
  </Container>
);
}

