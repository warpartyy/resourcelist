"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import EventCard from "./EventCard";

export default function EventsTab() {
  const supabase = getSupabase();

  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected"
  >("pending");

  const handleEventUpdate = (updatedEvent: any) => {
  setEvents((prev: any[]) =>
    prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
  );
};

const handleEventDelete = (id: string) => {
  setEvents((prev: any[]) => prev.filter((e) => e.id !== id));
};

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      return;
    }

    setEvents(data || []);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ Counts for tabs
  const counts = {
    pending: events.filter((e) => e.status === "pending").length,
    approved: events.filter((e) => e.status === "approved").length,
    rejected: events.filter((e) => e.status === "rejected").length,
  };

  // ✅ Filter based on active tab
  const filteredEvents = events.filter(
    (event) => event.status === activeTab
  );

  return (
    <div className="space-y-6">

      {/* 🔹 Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("pending")}
          className={`button ${
            activeTab === "pending" ? "button-primary" : ""
          }`}
        >
          Pending ({counts.pending})
        </button>

        <button
          onClick={() => setActiveTab("approved")}
          className={`button ${
            activeTab === "approved" ? "button-primary" : ""
          }`}
        >
          Approved ({counts.approved})
        </button>

        <button
          onClick={() => setActiveTab("rejected")}
          className={`button ${
            activeTab === "rejected" ? "button-primary" : ""
          }`}
        >
          Rejected ({counts.rejected})
        </button>
      </div>

      {/* 🔹 Event List */}
      {filteredEvents.map((event) => (
        <EventCard
  key={event.id}
  event={event}
  onUpdate={handleEventUpdate}
  onDelete={handleEventDelete}
/>
      ))}

      {/* 🔹 Empty State */}
      {filteredEvents.length === 0 && (
        <div>No {activeTab} events</div>
      )}
    </div>
  );
}