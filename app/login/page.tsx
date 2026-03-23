"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Container from "../../components/ui/Container";
import "@mfm/ui/src/components/button.css";
import { useEffect } from "react";

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
    alert(error.message || "Login failed.");
  }

  setLoading(false);
};


  return (
    <Container>
      <h1 className="text-4xl font-bold mb-6">
        Admin Login
      </h1>

      <form
        onSubmit={handleLogin}
        className="space-y-6 max-w-md bg-surface border border-border rounded-2xl p-6 shadow-md"
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
          {loading ? "Logging in..." : "Login"}
        </button>


      </form>
    </Container>
  );
}
