"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import MonthCalendar from "@/components/MonthCalendar";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import EmailBookingButton from "@/components/EmailBookingButton";

function formatDate(d) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = ((parseInt(h, 10) + 11) % 12) + 1;
  const ampm = parseInt(h, 10) >= 12 ? "PM" : "AM";
  return `${hour}:${m} ${ampm}`;
}

export default function CalendarView({ sessions }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const todayKey = new Date().toISOString().slice(0, 10);

  const sessionsByDate = useMemo(() => {
    const map = {};
    for (const s of sessions) {
      (map[s.session_date] ||= []).push(s);
    }
    return map;
  }, [sessions]);

  const upcoming = useMemo(
    () =>
      sessions
        .filter((s) => s.session_date >= todayKey)
        .sort((a, b) => (a.session_date + a.session_time).localeCompare(b.session_date + b.session_time)),
    [sessions, todayKey]
  );

  const past = useMemo(
    () =>
      sessions
        .filter((s) => s.session_date < todayKey)
        .sort((a, b) => (b.session_date + b.session_time).localeCompare(a.session_date + a.session_time)),
    [sessions, todayKey]
  );

  const listToShow = selectedDate
    ? sessions
        .filter((s) => s.session_date === selectedDate)
        .sort((a, b) => a.session_time.localeCompare(b.session_time))
    : upcoming;

  return (
    <div className="cal-layout">
      <div className="card mini-cal-card">
        <MonthCalendar
          sessionsByDate={sessionsByDate}
          onSelectDate={setSelectedDate}
          selectedDate={selectedDate}
        />
        <Link href="/dashboard/calendar/book" className="btn" style={{ marginTop: 16 }}>
          + Book Next Session
        </Link>
      </div>

      <div className="stack" style={{ flex: 1, minWidth: 0 }}>
        <div className="card">
          <div className="section-head" style={{ marginBottom: 10 }}>
            <h2>{selectedDate ? formatDate(selectedDate) : "Upcoming Sessions"}</h2>
            {selectedDate && (
              <button type="button" className="btn secondary" style={{ width: "auto" }} onClick={() => setSelectedDate(null)}>
                Show all upcoming
              </button>
            )}
          </div>

          {listToShow.length > 0 ? (
            <div className="table-wrap">
              <table className="sessions nice">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Notes</th>
                    <th>Calendar</th>
                  </tr>
                </thead>
                <tbody>
                  {listToShow.map((s) => (
                    <tr key={s.id}>
                      <td>{formatDate(s.session_date)}</td>
                      <td>{formatTime(s.session_time)}</td>
                      <td>
                        <Link href={`/dashboard/patients/${s.patient_id}`}>{s.patients?.name}</Link>
                      </td>
                      <td>{s.notes || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <AddToCalendarButton
                            id={s.id}
                            title={`Session — ${s.patients?.name || "Patient"}`}
                            dateStr={s.session_date}
                            timeStr={s.session_time}
                            description={s.notes || ""}
                          />
                          <EmailBookingButton
                            id={s.id}
                            title={`Session — ${s.patients?.name || "Patient"}`}
                            dateStr={s.session_date}
                            timeStr={s.session_time}
                            description={s.notes || ""}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">
              {selectedDate ? "No sessions on this day." : "No upcoming sessions booked. Book one to see it here."}
            </div>
          )}
        </div>

        {!selectedDate && past.length > 0 && (
          <div className="card">
            <h2>Past Sessions</h2>
            <div className="table-wrap">
              <table className="sessions nice">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {past.slice(0, 20).map((s) => (
                    <tr key={s.id}>
                      <td>{formatDate(s.session_date)}</td>
                      <td>{formatTime(s.session_time)}</td>
                      <td>
                        <Link href={`/dashboard/patients/${s.patient_id}`}>{s.patients?.name}</Link>
                      </td>
                      <td>{s.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
