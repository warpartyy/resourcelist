"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { updateAccountClient } from "@/lib/account/updateAccountClient";

export default function OnboardingPage() {
  const supabase = getSupabase();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const passwordsDoNotMatch =
  confirmPassword.length > 0 && password !== confirmPassword;
  const requiresPassword = !isOAuthUser;


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
      const provider = user.app_metadata?.provider;
      const providers = user.app_metadata?.providers;
      const signedInWithOAuth =
        provider === "google" ||
        provider === "azure" ||
        (Array.isArray(providers) &&
          providers.some((p) => p === "google" || p === "azure"));
      setIsOAuthUser(signedInWithOAuth);

const { data: profile, error } = await supabase
  .from("profiles")
  .select("display_name")
  .eq("id", user.id)
  .single();

if (error) {
  console.error(error);
  toast.error("Failed to load profile");
  return;
}

if (profile?.display_name) {
  router.push("/admin");
  return;
}

      setLoading(false);
    };

    loadProfile();
  }, [router, supabase]);

  
  const handleSave = async () => {
  if (!userId) return;

  const cleanDisplayName = displayName.trim();

  if (!cleanDisplayName) {
    toast.error("Display name is required");
    return;
  }

  if (requiresPassword && (!password || password !== confirmPassword)) {
    toast.error("Passwords do not match");
    return;
  }

  setSaving(true);

  try {
    const accountPayload = requiresPassword
      ? {
          userId,
          displayName: cleanDisplayName,
          password,
        }
      : { userId, displayName: cleanDisplayName };
    const updatedProfile = await updateAccountClient(accountPayload);

    toast.success("Setup complete");

    if (updatedProfile?.display_name) {
      router.push("/admin");
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to complete setup");
  }

  setSaving(false);
};

if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">
        Welcome! Let's finish setting up your account
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
            <p className="text-xs text-gray-500 mt-1">
                This will be shown to other admins
            </p>
        </div>

{requiresPassword && (
  <>
    <div>
      <label className="block text-sm mb-1">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        className="w-full border rounded p-2"
      />
        <p className="text-xs text-gray-500 mt-1">
            You can change this later in settings
        </p>
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
  </>
)}

        <button
          onClick={handleSave}
          disabled={
            saving ||
            !displayName.trim() ||
            (requiresPassword && !password) ||
            (requiresPassword && password !== confirmPassword)
          }
          className="button button-primary"
        >
          {saving ? "Setting up..." : "Complete Setup"}
        </button>

      </div>
    </div>
  );
}