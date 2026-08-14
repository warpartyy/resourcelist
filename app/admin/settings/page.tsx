"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import InviteAdminForm from "@/components/admin/InviteAdminForm";
import { getSupabase } from "@/lib/supabase";

export default function AdminSettingsPage() {
  const supabase = getSupabase();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [displayNameDraft, setDisplayNameDraft] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordsDoNotMatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  useEffect(() => {
    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push("/login");
        return;
      }

      const user = sessionData.session.user;
      setUserId(user.id);
      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      const profileName = profile?.display_name || "";
      setDisplayName(profileName);
      setDisplayNameDraft(profileName);
      setLoading(false);
    };

    loadProfile();
  }, [router, supabase]);

  const handleProfileSave = async (newName: string) => {
    if (!userId) return;

    if (!newName.trim()) {
      toast.error("Display name is required");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: newName.trim() })
      .eq("id", userId);

    if (error) {
      console.error(error);
      toast.error("Failed to update profile");
      setSaving(false);
      return;
    }

    setDisplayName(newName.trim());
    setDisplayNameDraft(newName.trim());

    toast.success("Profile updated");
    setSaving(false);
  };

  const handlePasswordSave = async () => {
    if (!userId) return;

    if (!password) {
      toast.error("Enter a password");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error(error);
      toast.error("Failed to update password");
      setSaving(false);
      return;
    }

    toast.success("Password updated");
    setPassword("");
    setConfirmPassword("");
    setSaving(false);
  };

  if (loading) return <p className="text-sm text-text-muted">Loading settings...</p>;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <section className="bg-surface border border-border rounded-xl p-4 shadow-sm h-full">
        <div>
          <h2 className="text-base font-semibold text-text-primary">General</h2>
          <p className="mt-1 text-sm text-text-muted">
            Manage your visible admin profile details.
          </p>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-text-muted">Current Name</p>
              <p className="mt-1 text-sm text-text-primary">{displayName || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Email</p>
              <p className="mt-1 break-all text-sm text-text-primary">{email}</p>
            </div>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-text-primary">
              Display Name
            </label>
            <input
              id="displayName"
              value={displayNameDraft}
              onChange={(event) => setDisplayNameDraft(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => handleProfileSave(displayNameDraft)}
            disabled={!displayNameDraft.trim() || saving}
            className="button button-primary px-3 py-1.5 text-sm"
          >
            {saving ? "Saving..." : "Save General"}
          </button>
        </div>
      </section>

      <section className="bg-surface border border-border rounded-xl p-4 shadow-sm h-full">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Security</h2>
          <p className="mt-1 text-sm text-text-muted">
            Update the password for your admin account.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-text-primary">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
              autoComplete="new-password"
              aria-describedby={passwordsDoNotMatch ? "passwordError" : undefined}
            />

            {passwordsDoNotMatch && (
              <p id="passwordError" className="mt-1 text-sm text-red-600">
                Passwords do not match
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handlePasswordSave}
            disabled={saving || !password || password !== confirmPassword}
            className="button button-primary px-3 py-1.5 text-sm"
          >
            {saving ? "Saving..." : "Save Security"}
          </button>
        </div>
      </section>

      <InviteAdminForm />
    </div>
  );
}
