"use client";

import { useMemo, useState } from "react";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function MonthCalendar({ sessionsByDate, onSelectDate, selectedDate }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const cells = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < firstDow; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [year, month]);

  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="mini-cal">
      <div className="mini-cal-head">
        <button
          type="button"
          className="mini-cal-nav"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="mini-cal-title">
          {MONTH_NAMES[month]} {year}
        </div>
        <button
          type="button"
          className="mini-cal-nav"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="mini-cal-grid mini-cal-weekdays">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="mini-cal-weekday">{w}</div>
        ))}
      </div>

      <div className="mini-cal-grid">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="mini-cal-cell empty" />;
          const key = toKey(year, month, d);
          const count = sessionsByDate[key]?.length || 0;
          const isToday = key === todayKey;
          const isSelected = key === selectedDate;
          return (
            <button
              type="button"
              key={i}
              onClick={() => onSelectDate(count > 0 ? key : null)}
              className={
                "mini-cal-cell" +
                (isToday ? " is-today" : "") +
                (isSelected ? " is-selected" : "") +
                (count > 0 ? " has-sessions" : "")
              }
            >
              <span>{d}</span>
              {count > 0 && <i className="mini-cal-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
