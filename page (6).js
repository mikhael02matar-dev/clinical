"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Look up the profile to know where to send this person.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const redirectParam = params.get("redirect");
    if (redirectParam) {
      router.replace(redirectParam);
    } else if (profile?.role === "patient") {
      router.replace("/patient");
    } else {
      router.replace("/dashboard");
    }
    router.refresh();
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <rect x="6" y="4" width="12" height="17" rx="2" />
              <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
              <line x1="9" y1="10" x2="15" y2="10" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="16" x2="13" y2="16" />
            </svg>
          </div>
          <Link href="/" className="brand" style={{ display: "block", marginTop: 10 }}>
            Axis<span>Motion</span>
          </Link>
          <div className="brand-sub">CLINICAL MVP</div>
        </div>
        <p className="sub">Sign in to your clinic account.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="foot-link">
          New physio on the team?{" "}
          <Link href="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
