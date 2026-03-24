"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function EventCard({ event }: { event: any }) {
  const supabase = getSupabase();

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({ ...event });

const updateField = (field: string, value: any) => {
  setForm((prev: any) => ({
    ...prev,
    [field]: value,
  }));
};

  // ✅ APPROVE
  const handleApprove = async () => {
    setLoading(true);

    await supabase
      .from("events")
      .update({ status: "approved" })
      .eq("id", event.id);

    setLoading(false);
    location.reload();
  };

  // ✅ REJECT
  const handleReject = async () => {
    setLoading(true);

    await supabase
      .from("events")
      .update({ status: "rejected" })
      .eq("id", event.id);

    setLoading(false);
    location.reload();
  };

  // ✅ DELETE
  const handleDelete = async () => {
    const confirmDelete = confirm("Delete this event?");
    if (!confirmDelete) return;

    setLoading(true);

    await supabase.from("events").delete().eq("id", event.id);

    setLoading(false);
    location.reload();
  };

  // ✅ SAVE EDIT
  const handleSave = async () => {
    setLoading(true);

    await supabase
      .from("events")
      .update({
        title: form.title,
        description: form.description,
        date: form.date,
        start_time: form.start_time,
        location_name: form.location_name,
        city: form.city,
        state: form.state,
      })
      .eq("id", event.id);

    setLoading(false);
    setIsEditing(false);
    location.reload();
  };

  return (
    <div className="border border-border rounded-xl p-5 bg-bg space-y-3">
      {/* 🔹 EDIT MODE */}
      {isEditing ? (
        <>
          <input
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full p-2 border rounded"
          />

          <textarea
            value={form.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            type="date"
            value={form.date || ""}
            onChange={(e) => updateField("date", e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            placeholder="Start time"
            value={form.start_time || ""}
            onChange={(e) => updateField("start_time", e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            placeholder="Location"
            value={form.location_name || ""}
            onChange={(e) => updateField("location_name", e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            placeholder="City"
            value={form.city || ""}
            onChange={(e) => updateField("city", e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            placeholder="State"
            value={form.state || ""}
            onChange={(e) => updateField("state", e.target.value)}
            className="w-full p-2 border rounded"
          />

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="button button-success"
            >
              Save
            </button>

            <button
              onClick={() => setIsEditing(false)}
              className="button button-secondary"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          {/* 🔹 VIEW MODE */}
          <h2 className="text-xl font-semibold">
            {event.title}
          </h2>

          <p className="text-sm text-text-muted">
            {event.date}
            {event.start_time && ` • ${event.start_time}`}
          </p>

          {event.location_name && (
            <p className="text-sm text-text-muted">
              {event.location_name}
            </p>
          )}

          {event.description && (
            <p>{event.description}</p>
          )}

          {/* 🔹 ACTIONS */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="button button-success"
            >
              Approve
            </button>

            <button
              onClick={handleReject}
              disabled={loading}
              className="button button-secondary"
            >
              Reject
            </button>

            <button
              onClick={() => setIsEditing(true)}
              className="button"
            >
              Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={loading}
              className="button button-danger"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}