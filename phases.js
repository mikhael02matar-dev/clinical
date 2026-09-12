export const PHASES = [
  { short: "Phase I", full: "Phase 1: Analgesic & Pain Management" },
  { short: "Phase II", full: "Phase 2: Mobility & Amplitude" },
  { short: "Phase III", full: "Phase 3: Strength & Stability" },
  { short: "Phase IV", full: "Phase 4: Functional Rehabilitation" },
  { short: "Phase V", full: "Phase 5: Return to Sport / Activity" },
];

export function phaseShortLabel(fullPhase) {
  const match = PHASES.find((p) => p.full === fullPhase);
  return match ? match.short : fullPhase || "—";
}

export const FILE_TYPES = ["MRI", "X-Ray", "Image", "Video", "Prescription", "Report", "PDF", "Other"];
