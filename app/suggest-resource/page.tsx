"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
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

      <p className="text-zinc-400 mb-6">
        Thank you for suggesting a resource.
        It will be reviewed before being published.
      </p>

      <button
        onClick={() => {
          setSubmitted(false);
          setSelectedSubcategories([]);
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
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
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Basic Information
          </h2>
          <p className="text-sm text-zinc-400">
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
                : "border-zinc-800 bg-zinc-900"
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
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Services & Categories
          </h2>
          <p className="text-sm text-zinc-400">
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
                  isSelected
                    ? "bg-blue-600 border-blue-400 text-white shadow-lg"
                    : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-blue-500"
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      </div>


      {/* ---------------- Contact Information ---------------- */}
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Contact Information
          </h2>
          <p className="text-sm text-zinc-400">
            How can someone get in touch?
          </p>
        </div>

        <input
          name="phone"
          placeholder="Phone"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
        />

        <input
          name="website"
          placeholder="Website"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
        />
      </div>


      {/* ---------------- Location (Optional) ---------------- */}
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Location (Optional)
          </h2>
          <p className="text-sm text-zinc-400">
            If known, provide the physical location.
          </p>
        </div>

        <input
          name="address"
          placeholder="Street Address"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            name="city"
            placeholder="City"
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"
          />

          <input
            name="state"
            placeholder="State (e.g. OK)"
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"
          />

          <input
            name="zip"
            placeholder="ZIP Code"
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"
          />
        </div>
      </div>


      {/* ---------------- Additional Details ---------------- */}
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Additional Details
          </h2>
          <p className="text-sm text-zinc-400">
            Help others understand what this organization provides.
          </p>
        </div>

        <textarea
          name="description"
          placeholder="Description"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
        />

        <input
          name="services"
          placeholder="Services (comma separated)"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
        />

        <input
          name="eligibility"
          placeholder="Eligibility"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
        />
      </div>


      {/* ---------------- Submit Button ---------------- */}
<div className="flex justify-center pt-0">
  <button
    type="submit"
    disabled={loading}
    className={`
      flex items-center justify-center gap-2
      bg-blue-600 hover:bg-blue-700
      disabled:bg-blue-600/60 disabled:cursor-not-allowed
      text-white px-8 py-3 rounded-xl
      transition shadow-lg font-medium
    `}
  >
    {loading && (
      <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
    )}
    {loading ? "Submitting..." : "Submit for Review"}
  </button>
</div>


    </form>
  </Container>
);
}

