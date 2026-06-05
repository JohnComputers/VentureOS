import { ScanSearch, ExternalLink } from "lucide-react";
import { C } from "../config.js";
import { Glass, Label } from "./ui.jsx";

export default function VerificationView({ verification }) {
  const v = verification;
  const verdictColor =
    v?.verdict === "supported" ? C.green : v?.verdict === "refuted" ? C.red : C.amber;
  return (
    <Glass style={{ padding: 18 }}>
      <Label icon={ScanSearch}>VERIFICATION ENGINE</Label>
      {v ? (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1 }}>RISKIEST ASSUMPTION</div>
          <div style={{ fontSize: 13, color: "#dfe5ff", marginTop: 4 }}>{v.claim}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <span style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1, background: verdictColor + "1c", color: verdictColor, border: `1px solid ${verdictColor}55` }}>
              {String(v.verdict || "").toUpperCase()}
            </span>
            <span style={{ fontSize: 11, color: C.dim }}>confidence {v.confidence}%</span>
            <span style={{ fontSize: 9.5, color: C.dim, marginLeft: "auto" }}>↳ live Google Search grounding</span>
          </div>
          <div style={{ fontSize: 12, color: "#c2cae8", marginTop: 12, lineHeight: 1.5 }}>{v.evidence}</div>
          {(v.sources || []).length > 0 && (
            <div style={{ marginTop: 12, display: "grid", gap: 5 }}>
              <div style={{ fontSize: 9.5, color: C.dim, letterSpacing: 1 }}>SOURCES</div>
              {v.sources.map((s, i) => (
                <a key={i} href={s.uri} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: C.cyan, textDecoration: "none" }}>
                  <ExternalLink size={11} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: C.dim, marginTop: 10 }}>No verification run yet.</div>
      )}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 10, color: C.dim, lineHeight: 1.6 }}>
        In production this engine would also check calculations, URLs, API responses, and generated code before anything reaches execution. Here it runs the highest-leverage check: the founding assumption, against the live web.
      </div>
    </Glass>
  );
}
