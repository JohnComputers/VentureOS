import { ShieldAlert, Check } from "lucide-react";
import { C } from "../config.js";
import { Glass, Label, Btn } from "./ui.jsx";

export default function ApprovalQueue({ tasks, onApprove, onReject }) {
  const pending = (tasks || []).filter((t) => t.needsApproval && t.status === "awaiting-approval");
  if (pending.length === 0) return null;
  return (
    <Glass style={{ padding: 16, border: `1px solid ${C.amber}44` }}>
      <Label icon={ShieldAlert} color={C.amber}>HUMAN APPROVAL REQUIRED</Label>
      <div style={{ fontSize: 10, color: C.dim, marginTop: 4, marginBottom: 10 }}>
        Spend, legal, and launch actions never auto-execute.
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {pending.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: 10, borderRadius: 12, background: "#11162a", border: `1px solid ${C.border}` }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{t.title}</div>
              <div style={{ fontSize: 9.5, color: C.dim }}>
                {t.owner} · <span style={{ color: C.amber }}>{t.kind}</span>
                {t.conf != null ? ` · ${t.conf}%` : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn onClick={() => onApprove(t)} tiny><Check size={12} />approve</Btn>
              <Btn onClick={() => onReject(t)} tiny ghost>reject</Btn>
            </div>
          </div>
        ))}
      </div>
    </Glass>
  );
}
