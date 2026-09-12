"use client";

import { buildICS } from "@/lib/ics";

export default function AddToCalendarButton({ id, title, dateStr, timeStr, description }) {
  function handleClick() {
    const ics = buildICS({ uid: id, title, dateStr, timeStr, description });
    const dataUri = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
    // iOS Safari blocks blob-download links, but opens data: URIs for
    // text/calendar directly into its native "Add to Calendar" preview.
    window.location.href = dataUri;
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

