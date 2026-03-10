"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Container from "../../components/ui/Container";
import "@mfm/ui/src/components/button.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

const handleLogin = async (e: any) => {
  e.preventDefault();

  const supabase = getSupabase();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!error) {
    router.push("/admin");
  } else {
    alert("Login failed.");
  }
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

        <button className="button button-primary w-full">
  Login
</button>
      </form>
    </Container>
  );
}
