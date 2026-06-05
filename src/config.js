// ---- Model / tuning -------------------------------------------------------
// gemini-2.5-flash is the current free-tier workhorse (Google AI Studio).
// Free tier as of Q2 2026 is roughly 10 requests/min, 500 requests/day.
// Swap to "gemini-2.5-flash-lite" for an even lighter/faster free option,
// or a 3.x model if you enable billing.
export const GEMINI_MODEL = "gemini-2.5-flash";
export const GEMINI_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Confidence at/above which the system may act without human escalation.
export const THRESHOLD = 70;

// Spacing between sequential model calls to stay under free-tier RPM limits.
export const CALL_SPACING_MS = 800;

// Task kinds that always require human approval before they are "executed".
export const CONSEQUENTIAL = ["spend", "legal", "launch"];
export const isConsequential = (kind) => CONSEQUENTIAL.includes(kind);

// ---- Visual system --------------------------------------------------------
export const C = {
  ink: "#06070e",
  panel: "rgba(18,22,38,0.55)",
  border: "rgba(125,145,255,0.16)",
  cyan: "#46e6ff",
  violet: "#9b7bff",
  green: "#37f0a4",
  amber: "#ffc24b",
  red: "#ff5d73",
  dim: "#8a93b6",
  text: "#e8ecff",
};
export const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
export const DISPLAY = "'Chakra Petch', sans-serif";

// ---- Agents ---------------------------------------------------------------
// `active` agents make live Gemini calls each cycle; standby agents are wired
// but dormant to conserve the free-tier request budget.
export const AGENTS = [
  { k: "CEO", name: "CEO", role: "Strategy & thesis", icon: "Crown", active: true },
  { k: "Research", name: "Research", role: "Market & fact verification", icon: "Search", active: true },
  { k: "CFO", name: "CFO", role: "Runway & feasibility", icon: "DollarSign", active: true },
  { k: "Risk", name: "Risk + Legal", role: "Exposure & compliance", icon: "Scale", active: true },
  { k: "QA", name: "QA / Red-team", role: "Self-check & adjudication", icon: "ScanSearch", active: true },
  { k: "Growth", name: "Growth", role: "Improvement loop", icon: "TrendingUp", active: true },
  { k: "COO", name: "COO", role: "Operations", icon: "Workflow", active: false },
  { k: "CTO", name: "CTO", role: "Build & infra", icon: "Cpu", active: false },
  { k: "CMO", name: "CMO", role: "Positioning", icon: "Megaphone", active: false },
  { k: "Sales", name: "Sales", role: "Pipeline", icon: "Activity", active: false },
  { k: "Automation", name: "Automation", role: "Workflow wiring", icon: "Boxes", active: false },
];

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
