"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "physio", name },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <Link href="/" className="brand">
            Axis<span>Motion</span>
          </Link>
          <p className="sub" style={{ marginTop: 16 }}>
            Account created. Check your email to confirm it, then sign in.
          </p>
          <Link href="/login" className="btn secondary" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
            Go to sign in
          </Link>
        </div>
      </div>
    );
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
        <p className="sub">Create a physio account for the practice.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="foot-link">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
