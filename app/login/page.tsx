"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Container from "../../components/ui/Container";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();

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

      <form onSubmit={handleLogin} className="space-y-6 max-w-md">
        <input
          type="email"
          placeholder="Email"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-blue-600 px-6 py-3 rounded-lg">
          Login
        </button>
      </form>
    </Container>
  );
}
