"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { getSupabase } from "@/lib/supabase";

export default function InviteAdminForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) {
      toast.error("Please enter an email");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      if (!token) {
        throw new Error("You must be logged in");
      }

      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success("Admin invite sent");
      setEmail("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send invite";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-surface border border-border rounded-xl p-4 shadow-sm h-full">
      <div>
        <h2 className="text-base font-semibold text-text-primary">Admin Team</h2>
        <p className="mt-1 text-sm text-text-muted">
          Invite additional admins to help keep the directory current.
        </p>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="adminInviteEmail" className="block text-sm font-medium text-text-primary">
            Admin Email
          </label>
          <input
            id="adminInviteEmail"
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleInvite}
            disabled={loading || !email.trim()}
            className="button button-primary px-3 py-1.5 text-sm"
          >
            {loading ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </div>
    </section>
  );
}
