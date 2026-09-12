import nodemailer from "nodemailer";
import { buildICS } from "@/lib/ics";

export async function POST(req) {
  const { to, title, dateStr, timeStr, description } = await req.json();

  if (!to || !dateStr || !timeStr) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return Response.json(
      { error: "Email isn't configured yet. Add GMAIL_USER and GMAIL_APP_PASSWORD in your project's environment variables." },
      { status: 500 }
    );
  }

  const ics = buildICS({
    uid: `${dateStr}-${timeStr}-${Math.random().toString(36).slice(2)}`,
    title: title || "Physio session",
    dateStr,
    timeStr,
    description: description || "",
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Axis Motion" <${process.env.GMAIL_USER}>`,
      to,
      subject: `Session booking — ${dateStr} at ${timeStr}`,
      text:
        `Your session is booked for ${dateStr} at ${timeStr}.\n\n` +
        (description ? `Note: ${description}\n\n` : "") +
        `Open the attached file on your phone and tap "Add to Calendar" to save it.`,
      attachments: [
        {
          filename: "session.ics",
          content: ics,
          contentType: "text/calendar; charset=utf-8; method=PUBLISH",
        },
      ],
    });

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
