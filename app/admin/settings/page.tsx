"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ProfileCard from "@/components/settings/ProfileCard";
import AccountSection from "@/components/settings/AccountSection";
import SecuritySection from "@/components/settings/SecuritySection";


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

  // ✅ update saved state AFTER success
  setDisplayName(newName.trim());

  toast.success("Profile updated");
  setSaving(false);
};




const handlePasswordSave = async () => {
  if (!userId) return;

  // Password optional
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

  // Clear fields after success
  setPassword("");
  setConfirmPassword("");

  setSaving(false);
};

if (loading) return <p className="p-6">Loading...</p>;
return (
  <div className="p-6 max-w-3xl space-y-8">
    
    {/* Profile Overview */}
    <ProfileCard
      displayName={displayName}
      email={email}
    />

    {/* Account Info */}
<AccountSection
  displayName={displayName}
  saving={saving}
  onSave={handleProfileSave}
/>

    {/* Security */}
    <SecuritySection
      password={password}
      confirmPassword={confirmPassword}
      setPassword={setPassword}
      setConfirmPassword={setConfirmPassword}
      saving={saving}
      onSave={handlePasswordSave}
    />

  </div>
);
}