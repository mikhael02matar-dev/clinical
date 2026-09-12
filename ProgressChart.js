"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ProgressChart({ sessions }) {
  const data = sessions
    .filter((s) => s.pain_after !== null && s.pain_after !== undefined)
    .map((s) => ({
      date: new Date(s.session_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      pain: s.pain_after,
    }));

  if (data.length < 2) {
    return (
      <div className="empty">Log at least two sessions with a pain score to see a trend.</div>
    );
  }

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#e1e7f7" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#7580a0" }} axisLine={{ stroke: "#e1e7f7" }} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: "#7580a0" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #e1e7f7", fontSize: 13 }}
            labelStyle={{ color: "#16224e" }}
          />
          <Line type="monotone" dataKey="pain" stroke="#16224e" strokeWidth={3} dot={{ r: 4, fill: "#3a5cf0" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
