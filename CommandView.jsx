import { Crown, TrendingUp, ScanSearch, Loader2 } from "lucide-react";
import { C, DISPLAY } from "../config.js";
import { Glass, Label, Btn } from "./ui.jsx";

export default function CommandView({ venture, running, onRefound, onImprove }) {
  const strategy = venture?.thesis ? venture : null;
  const check = venture?.selfCheck;
  return (
    <Glass style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
        <Label icon={Crown}>STRATEGIC CORE</Label>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={onRefound} disabled={running} ghost>{running ? "running…" : "re-found"}</Btn>
          <Btn onClick={onImprove} disabled={running || !strategy}>
            {running ? <Loader2 size={13} style={{ animation: "vspin .9s linear infinite" }} /> : <TrendingUp size={13} />}
            run improvement cycle
          </Btn>
        </div>
      </div>

      {strategy ? (
        <>
          <div style={{ fontSize: 13.5, lineHeight: 1.5, color: "#dfe5ff" }}>{venture.thesis}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {(venture.objectives || []).map((o, i) => (
              <span key={i} style={{ fontSize: 10.5, padding: "4px 9px", borderRadius: 20, background: "#11162a", border: `1px solid ${C.border}`, color: "#bcc6f0" }}>◇ {o}</span>
            ))}
          </div>

          {check && (
            <div style={{ marginTop: 12, padding: 10, borderRadius: 12, background: check.escalate ? C.amber + "12" : C.green + "10", border: `1px solid ${check.escalate ? C.amber + "44" : C.green + "33"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: 1, color: check.escalate ? C.amber : C.green, fontFamily: DISPLAY }}>
                <ScanSearch size={12} />
                SELF-CHECK · proceed with {check.chosen} · {check.confidence}%
                {check.escalate && <span style={{ color: C.amber }}>· ESCALATED</span>}
              </div>
              <div style={{ fontSize: 11, color: "#cbd3f5", marginTop: 5 }}>{check.rationale}</div>
              {check.critique?.alternative && (
                <div style={{ fontSize: 10.5, color: C.dim, marginTop: 6 }}>alt considered: {check.critique.alternative}</div>
              )}
            </div>
          )}
        </>
      ) : (
        <div style={{ fontSize: 12, color: C.dim }}>No strategy yet.</div>
      )}
    </Glass>
  );
}
