"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function ShareEventPage() {
  const supabase = getSupabase();

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    location_name: "",
    city: "",
    state: "",
    organization: "",
    contact_info: "",
    link: "",
    is_free: false,
    audience: "",
    event_type: "",
    is_tribal: false,
    tribe: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log("SUBMIT FORM SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    setLoading(true);

    const { error } = await supabase.from("events").insert([
      {
        ...form,
        status: "pending",
      },
    ]);

    setLoading(false);

    if (!error) {
      setSuccess(true);
      setForm({
        title: "",
        description: "",
        date: "",
        start_time: "",
        end_time: "",
        location_name: "",
        city: "",
        state: "",
        organization: "",
        contact_info: "",
        link: "",
        is_free: false,
        audience: "",
        event_type: "",
        is_tribal: false,
        tribe: "",
      });
    } else {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <h1 className="text-2xl font-semibold mb-4">
          Thanks for sharing this event
        </h1>
        <p className="text-text-muted">
          Our team will review it and add it soon.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-3xl font-semibold mb-6">
        Share an Event
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          placeholder="Event Title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          required
          className="w-full p-3 border rounded-lg"
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) => updateField("date", e.target.value)}
          required
          className="w-full p-3 border rounded-lg"
        />

        <input
          placeholder="Start Time (optional)"
          value={form.start_time}
          onChange={(e) => updateField("start_time", e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <input
          placeholder="Location Name"
          value={form.location_name}
          onChange={(e) => updateField("location_name", e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <input
          placeholder="City"
          value={form.city}
          onChange={(e) => updateField("city", e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <input
          placeholder="State"
          value={form.state}
          onChange={(e) => updateField("state", e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <input
          placeholder="Organization (optional)"
          value={form.organization}
          onChange={(e) => updateField("organization", e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <input
          placeholder="Event Link (optional)"
          value={form.link}
          onChange={(e) => updateField("link", e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_free}
            onChange={(e) => updateField("is_free", e.target.checked)}
          />
          Free Event
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_tribal}
            onChange={(e) => updateField("is_tribal", e.target.checked)}
          />
          Tribal Event
        </label>

        {form.is_tribal && (
          <input
            placeholder="Tribe"
            value={form.tribe}
            onChange={(e) => updateField("tribe", e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        )}

<button
  type="submit"
  disabled={loading}
  className={`button button-primary ${
    loading ? "button-disabled" : ""
  }`}
>
  {loading ? "Submitting..." : "Submit Event"}
</button>

      </form>
    </div>
  );
}