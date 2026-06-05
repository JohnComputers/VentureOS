import { Activity } from "lucide-react";
import { C, MONO } from "../config.js";
import { Glass, Label, feedColor } from "./ui.jsx";

export default function Feed({ feed }) {
  return (
    <Glass style={{ padding: 16 }}>
      <Label icon={Activity}>LIVE ACTIVITY FEED</Label>
      <div style={{ marginTop: 10, maxHeight: 280, overflowY: "auto", display: "grid", gap: 6 }}>
        {(!feed || feed.length === 0) && <div style={{ fontSize: 11, color: C.dim }}>awaiting telemetry…</div>}
        {(feed || []).map((f) => (
          <div key={f.id} style={{ display: "flex", gap: 8, fontSize: 11, lineHeight: 1.45, fontFamily: MONO }}>
            <span style={{ color: "#566", flexShrink: 0 }}>
              {f.ts ? new Date(f.ts).toLocaleTimeString([], { hour12: false }) : ""}
            </span>
            <span style={{ color: feedColor(f.kind), flexShrink: 0, fontWeight: 600, minWidth: 66 }}>{f.agent}</span>
            <span style={{ color: "#c2cae8" }}>{f.text}</span>
          </div>
        ))}
      </div>
    </Glass>
  );
}
