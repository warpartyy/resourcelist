"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import "@mfm/ui/src/components/button.css";
import { useEffect } from "react";
import OAuthButtons from "@/components/auth/OAuthButtons";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [loading, setLoading] = useState(false);

useEffect(() => {
  const checkSession = async () => {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      router.push("/admin");
    }
  };

  checkSession();
}, [router]);


const handleLogin = async (e: any) => {
  e.preventDefault();

  if (loading) return;
  setLoading(true);

  const supabase = getSupabase();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!error) {
    router.replace("/admin");
  } else {
    toast.error(error.message || "Login failed.");
  }

  setLoading(false);
};


  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Community Resource Directory
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            Review, verify, and manage community resources for Native and
            Indigenous communities.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-5 text-center">Admin Sign In</h2>

          <OAuthButtons />

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs font-medium tracking-widest text-text-secondary">
              OR
            </span>
            <div className="h-px bg-border flex-1" />
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full bg-bg border border-border rounded-lg p-3 text-text-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              disabled={loading}
              className="button button-primary w-full"
              >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/help" className="text-sm text-text-secondary hover:underline">
              Forgot Password
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-text-secondary">
            Need access? Contact an administrator for an invitation.
          </p>
        </div>
      </div>
    </div>
  );
}
