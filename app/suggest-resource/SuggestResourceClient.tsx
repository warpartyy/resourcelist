"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import Container from "../../components/ui/Container";
import { PARENT_CATEGORIES, SUBCATEGORIES, SUBCATEGORY_PARENT_MAP} from "@/lib/taxonomy";
import { useSearchParams } from "next/navigation";
import { useRef } from "react";
import {
  BasicInfoSection,
  ServicesSection,
  AdditionalDetailsSection,
} from "@/components/forms/suggest-resource";
import toast from "react-hot-toast";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-")         // spaces → hyphens
    .replace(/-+/g, "-");         // collapse multiple hyphens
}

export default function SuggestResourcePage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ organization?: string; subcategories?: string; email?: string;}>({});
  
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const [isTribal, setIsTribal] = useState(false);
  const [tribe, setTribe] = useState("");
  const searchParams = useSearchParams();
  const existingSlug = searchParams.get("resource");

  const organizationRef = useRef<HTMLInputElement | null>(null);
  const subcategoryRef = useRef<HTMLDivElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

const fieldRefs: Record<string, React.RefObject<HTMLElement>> = {
  organization: organizationRef as React.RefObject<HTMLElement>,
  subcategories: subcategoryRef as React.RefObject<HTMLElement>,
  email: emailRef as React.RefObject<HTMLElement>,
};




  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
const organizationName = formData.get("organization")?.toString().trim();
const slug = generateSlug(organizationName || "");

let newErrors: {
  organization?: string;
  subcategories?: string;
  email?: string;
} = {};

if (!organizationName) {
  newErrors.organization = "Organization name is required.";
}

if (!selectedSubcategories.length) {
  newErrors.subcategories = "Please select at least one category.";
}

const email = formData.get("email")?.toString();

if (email && !email.includes("@")) {
  newErrors.email = "Please enter a valid email.";
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
  slug,
  organization: organizationName,
  subcategories: selectedSubcategories,
  tags: [],
  counties_served: formData.get("counties")
    ? formData.get("counties")!.toString().split(",").map((c) => c.trim())
    : [],
  phone: formData.get("phone")?.toString() || null,
  email: formData.get("email")?.toString() || null,
  website: formData.get("website")?.toString() || null,
  address: formData.get("address")?.toString() || null,
  city: formData.get("city")?.toString() || null,
  state: formData.get("state")?.toString() || null,
  zip: formData.get("zip")?.toString() || null,


  is_tribal: formData.get("is_tribal") === "on",
  tribe: formData.get("tribe")?.toString() || null,

  description: formData.get("description")?.toString() || null,
services: selectedServices,
  eligibility: formData.get("eligibility")?.toString() || null,
  status: "pending",
};


const supabase = getSupabase();

// ✅ 1. Show loading FIRST
const toastId = toast.loading("Submitting resource...");

// ✅ 2. Make request
const response = await supabase
  .from("resources")
  .insert([newSubmission]);

// ✅ 3. Update toast based on result
if (response.error) {
  console.error("Submission error:", response.error);
  toast.error("Something went wrong while submitting.", { id: toastId });
} else {
  toast.success("Resource submitted for review!", { id: toastId });
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
          setSelectedServices([]);
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

<BasicInfoSection
  errors={errors}
  organizationRef={organizationRef}
  emailRef={emailRef}
  isTribal={isTribal}
  setIsTribal={setIsTribal}
  tribe={tribe}
  setTribe={setTribe}
/>

<ServicesSection
  selectedSubcategories={selectedSubcategories}
  setSelectedSubcategories={setSelectedSubcategories}
  selectedServices={selectedServices}
  setSelectedServices={setSelectedServices}
  errors={errors}
  subcategoryRef={subcategoryRef}
/>

  <AdditionalDetailsSection />

  {/* Submit Button */}
  <div className="flex justify-center">
    <button
      type="submit"
      disabled={loading}
      className="button button-primary"
    >
      {loading ? "Submitting..." : "Submit for Review"}
    </button>
  </div>

</form>
  </Container>
);
}