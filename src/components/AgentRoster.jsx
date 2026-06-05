import {
  Crown, Search, DollarSign, Scale, ScanSearch, TrendingUp,
  Workflow, Cpu, Megaphone, Activity, Boxes, Loader2, CircleDot,
} from "lucide-react";
import { AGENTS, C, DISPLAY } from "../config.js";
import { Glass, Label, agentColor } from "./ui.jsx";

const ICONS = { Crown, Search, DollarSign, Scale, ScanSearch, TrendingUp, Workflow, Cpu, Megaphone, Activity, Boxes };

export default function AgentRoster({ agentStatus }) {
  return (
    <Glass style={{ padding: 14, alignSelf: "start" }}>
      <Label icon={Activity}>AGENT ROSTER</Label>
      <div style={{ display: "grid", gap: 7, marginTop: 10 }}>
        {AGENTS.map((a) => {
          const Icon = ICONS[a.icon];
          const st = (agentStatus && agentStatus[a.k]) || (a.active ? "idle" : "standby");
          return (
            <div key={a.k} style={{ display: "flex", alignItems: "center", gap: 9, opacity: a.active ? 1 : 0.45 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#11162a", display: "grid", placeItems: "center", border: `1px solid ${C.border}` }}>
                <Icon size={14} color={agentColor(st)} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, fontFamily: DISPLAY }}>{a.name}</div>
                <div style={{ fontSize: 9, color: C.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.role}</div>
              </div>
              {st === "thinking" ? (
                <Loader2 size={13} color={C.cyan} style={{ animation: "vspin 0.9s linear infinite" }} />
              ) : (
                <CircleDot size={11} color={agentColor(st)} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 12, fontSize: 9, color: C.dim, lineHeight: 1.5 }}>
        Active agents make live Gemini calls each cycle. Standby agents are wired but dormant to conserve the free-tier request budget.
      </div>
    </Glass>
  );
}
