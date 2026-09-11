function buildWhatsAppLink(patient) {
  const digits = (patient.phone || "").replace(/\D/g, "");
  const firstName = (patient.name || "").split(" ")[0];
  const message =
    `Hello ${firstName},\n\n` +
    `This is a friendly reminder of your upcoming physiotherapy session at Axis Motion on [DATE] at [TIME].\n\n` +
    `Please let us know if you need to reschedule.\n\n` +
    `See you then!`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export default function RemindButton({ patient }) {
  if (!patient.phone) return null;
  return (
    <a href={buildWhatsAppLink(patient)} target="_blank" rel="noreferrer" className="btn whatsapp">
      Remind
    </a>
  );
}
