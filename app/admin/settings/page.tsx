"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";


export default function AdminSettingsPage() {
  const supabase = getSupabase();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
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

      if (profile?.display_name) {
        setDisplayName(profile.display_name);
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

const handleSave = async () => {
  if (!userId) return;

  if (!password || password !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  setSaving(true);

  // 🔑 1. Update password in Supabase Auth
  const { error: passwordError } = await supabase.auth.updateUser({
    password,
  });

  if (passwordError) {
    console.error(passwordError);
    toast.error("Failed to set password");
    setSaving(false);
    return;
  }

  // 🧾 2. Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", userId);

  if (profileError) {
    console.error(profileError);
    toast.error("Failed to update profile");
    setSaving(false);
    return;
  }

toast.success("Profile setup complete");

// ✅ SMALL DELAY to ensure DB + session sync
setTimeout(() => {
  window.location.href = "/admin";
}, 300);

setSaving(false);
}; // ✅ ← THIS WAS MISSING


if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">
        Admin Settings
      </h1>

      <div className="space-y-4">

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            value={email}
            disabled
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Display Name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
            className="w-full border rounded p-2"
          />
        </div>

<div>
  <label className="block text-sm mb-1">Password</label>
  <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter password"
    className="w-full border rounded p-2"
  />
</div>

<div>
  <label className="block text-sm mb-1">Confirm Password</label>
  <input
    type="password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    placeholder="Confirm password"
    className="w-full border rounded p-2"
  />

  {passwordsDoNotMatch && (
    <p className="text-sm text-red-500 mt-1">
      Passwords do not match
    </p>
  )}
</div>


        <button
          onClick={handleSave}
          disabled={
            saving ||
            !displayName ||
            !password ||
            password !== confirmPassword
          }
          className="button button-primary"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>


      </div>
    </div>
  );
}