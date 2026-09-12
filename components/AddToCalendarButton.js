"use client";

import { buildICS } from "@/lib/ics";

export default function AddToCalendarButton({ id, title, dateStr, timeStr, description }) {
  function handleClick() {
    const ics = buildICS({ uid: id, title, dateStr, timeStr, description });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "session.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" className="cal-add-btn" onClick={handleClick} title="Add to phone calendar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="4.5" width="18" height="16" rx="2" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4M12 13v5M9.5 15.5h5" />
      </svg>
      Add to phone
    </button>
  );
}
