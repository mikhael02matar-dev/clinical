"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EmailBookingButton({ id, title, dateStr, timeStr, description }) {
  const supabase = createClient();
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleClick() {
    setStatus("sending");
    setErrorMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setStatus("error");
      setErrorMsg("Couldn't find your account email.");
      return;
    }

    try {
      const res = await fetch("/api/send-booking-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: user.email, title, dateStr, timeStr, description }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send.");

      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  }

  return (
    <span>
      <button
        type="button"
        className="cal-add-btn"
        onClick={handleClick}
        disabled={status === "sending"}
        title="Email this booking to yourself"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 6l9 7 9-7" />
        </svg>
        {status === "sent" ? "Emailed ✓" : status === "sending" ? "Sending…" : "Email me this"}
      </button>
      {status === "error" && (
        <div style={{ color: "#b3364a", fontSize: "0.72rem", marginTop: 4 }}>{errorMsg}</div>
      )}
    </span>
  );
}
