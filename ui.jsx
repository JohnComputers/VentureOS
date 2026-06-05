import { C, MONO, DISPLAY, THRESHOLD } from "../config.js";

export const Glass = ({ children, style, className }) => (
  <div
    className={className}
    style={{
      background: C.panel,
      border: `1px solid ${C.border}`,
      borderRadius: 18,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px -30px rgba(0,0,0,0.8)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Label = ({ children, icon: Icon, color = C.cyan }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, letterSpacing: 1.5, color, fontWeight: 600, fontFamily: DISPLAY }}>
    {Icon && <Icon size={14} />}
    {children}
  </div>
);

export const FieldLabel = ({ children }) => (
  <div style={{ fontSize: 9.5, color: C.dim, letterSpacing: 1, marginBottom: 5, fontFamily: DISPLAY }}>{children}</div>
);

export const Legend = ({ c, children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
    {children}
  </span>
);

export const Stat = ({ label, value, color = C.text }) => (
  <div style={{ padding: "8px 14px", borderRadius: 12, background: "#0d1124", border: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1 }}>{label}</div>
    <div style={{ fontSize: 15, fontWeight: 700, color, textTransform: "capitalize", fontFamily: DISPLAY }}>{value}</div>
  </div>
);

export const ConfRing = ({ v, size = 30 }) => {
  const r = (size - 5) / 2;
  const circ = 2 * Math.PI * r;
  const col = v == null ? "#2c3450" : v >= THRESHOLD ? C.green : v >= 50 ? C.amber : C.red;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#1c2238" strokeWidth="3" fill="none" />
      {v != null && (
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={col} strokeWidth="3" fill="none"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - v / 100)} strokeLinecap="round"
        />
      )}
    </svg>
  );
};

export function Btn({ children, onClick, disabled, ghost, big, tiny }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        justifyContent: "center",
        width: big ? "100%" : "auto",
        padding: big ? "13px 18px" : tiny ? "5px 10px" : "8px 14px",
        borderRadius: big ? 12 : 10,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: DISPLAY,
        fontSize: tiny ? 10.5 : big ? 13 : 11.5,
        letterSpacing: 0.5,
        fontWeight: 600,
        color: ghost ? C.dim : C.ink,
        background: ghost ? "transparent" : `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
        border: ghost ? `1px solid ${C.border}` : "none",
        opacity: disabled ? 0.5 : 1,
        boxShadow: ghost ? "none" : `0 8px 24px -10px ${C.cyan}aa`,
      }}
    >
      {children}
    </button>
  );
}

export const feedColor = (kind) =>
  ({ work: C.cyan, out: C.green, warn: C.amber, error: C.red, info: C.dim }[kind] || C.dim);

export const agentColor = (status) =>
  ({ thinking: C.cyan, done: C.green, escalated: C.amber, error: C.red, idle: C.dim, standby: "#465" }[status] || C.dim);
