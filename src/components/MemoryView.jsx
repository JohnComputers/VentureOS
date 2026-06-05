import { Database } from "lucide-react";
import { C } from "../config.js";
import { Glass, Label } from "./ui.jsx";

const typeColor = {
  decision: C.cyan, verification: C.green, escalation: C.amber, risk: C.red, lesson: C.violet,
};

export default function MemoryView({ memory }) {
  return (
    <Glass style={{ padding: 18 }}>
      <Label icon={Database}>VENTURE MEMORY</Label>
      <div style={{ fontSize: 9.5, color: C.dim, marginTop: 4, marginBottom: 10 }}>
        Decisions, verifications, escalations &amp; lessons — persisted in Firestore and reloaded across sessions.
        (Production adds semantic vector recall; this stores the full ledger.)
      </div>
      <div style={{ display: "grid", gap: 7, maxHeight: 420, overflowY: "auto" }}>
        {(!memory || memory.length === 0) && <div style={{ fontSize: 12, color: C.dim }}>empty</div>}
        {(memory || []).map((m) => (
          <div key={m.id} style={{ display: "flex", gap: 8, padding: 9, borderRadius: 10, background: "#0d1124", border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 8.5, color: typeColor[m.type] || C.dim, letterSpacing: 1, fontWeight: 700, flexShrink: 0, minWidth: 78, paddingTop: 1 }}>
              {String(m.type || "").toUpperCase()}
            </span>
            <span style={{ fontSize: 11, color: "#c2cae8", lineHeight: 1.4 }}>{m.text}</span>
          </div>
        ))}
      </div>
    </Glass>
  );
}
