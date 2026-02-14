"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Container from "../../components/ui/Container";

export default function SuggestResourcePage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

const categoryValue = formData.get("category");

const newSubmission = {
  organization: formData.get("organization")?.toString() || null,
  categories: categoryValue ? [categoryValue.toString()] : [],
  counties_served: formData.get("counties")
    ? formData.get("counties")!.toString().split(",").map((c) => c.trim())
    : [],
  phone: formData.get("phone")?.toString() || null,
  website: formData.get("website")?.toString() || null,
  address: formData.get("address")?.toString() || null,
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
        <p className="text-zinc-400">
          Thank you for suggesting a resource. 
          It will be reviewed before being published.
        </p>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="text-4xl font-bold mb-6">
        Suggest a Resource
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-2xl"
      >

        <input
          name="organization"
          placeholder="Organization Name"
          required
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
        />

        <select
          name="category"
          required
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
        >
          <option value="">Select Category</option>
          <option value="mental-health">Mental Health</option>
          <option value="substance-use">Substance Use</option>
          <option value="food-assistance">Food Assistance</option>
          <option value="housing-support">Housing Support</option>
        </select>

        <input
          name="counties"
          placeholder="Counties Served (comma separated)"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
        />

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

        <input
          name="address"
          placeholder="Address"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
        />

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

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
        >
          {loading ? "Submitting..." : "Submit for Review"}
        </button>

      </form>
    </Container>
  );
}
