"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AccountSettings({ email }) {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess("Password updated.");
    setPassword("");
    setConfirm("");
  }

  return (
    <div className="stack" style={{ maxWidth: 420 }}>
      <div className="card">
        <h2>Account</h2>
        <div className="info-list">
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Email</label>
            <input type="text" value={email} readOnly />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card stack">
        <h2>Change Password</h2>
        <p style={{ color: "var(--slate-soft)", fontSize: "0.85rem", marginTop: -8 }}>
          For security, your current password can't be displayed — set a new one below any time.
        </p>
        <div className="field">
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
        <button className="btn" type="submit" style={{ width: "auto" }} disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
