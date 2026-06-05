import { useMemo } from "react";
import { DollarSign, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { C, MONO } from "../config.js";
import { Glass, Label, Stat } from "./ui.jsx";

export default function FinancialsView({ financials, target }) {
  const fin = financials;
  const data = useMemo(() => {
    if (!fin) return [];
    const months = Math.max(3, Math.min(18, Math.round(fin.estMonthsToTarget || 6)));
    const tgt = parseFloat(target) || 3000;
    const cost = fin.estMonthlyCost || 200;
    const first = fin.estMonthsToFirstRevenue || 1;
    return Array.from({ length: months + 1 }, (_, m) => ({
      m: "M" + m,
      cost: cost * m,
      revenue: Math.round(tgt * Math.min(1, Math.max(0, (m - first) / Math.max(1, months - first)))),
    }));
  }, [fin, target]);

  return (
    <Glass style={{ padding: 18 }}>
      <Label icon={DollarSign}>FINANCIAL MODEL</Label>
      {fin ? (
        <>
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <Stat label="FEASIBILITY" value={fin.feasibility} color={fin.feasibility === "high" ? C.green : fin.feasibility === "medium" ? C.amber : C.red} />
            <Stat label="MONTHLY COST" value={"$" + fin.estMonthlyCost} />
            <Stat label="TO 1ST REV" value={fin.estMonthsToFirstRevenue + "mo"} />
            <Stat label="TO TARGET" value={fin.estMonthsToTarget + "mo"} />
          </div>
          <div style={{ height: 200, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="#1c2238" />
                <XAxis dataKey="m" stroke="#566" fontSize={10} />
                <YAxis stroke="#566" fontSize={10} />
                <Tooltip contentStyle={{ background: "#0c1020", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 11, fontFamily: MONO }} />
                <Line type="monotone" dataKey="revenue" stroke={C.green} strokeWidth={2} dot={false} name="Modelled revenue" />
                <Line type="monotone" dataKey="cost" stroke={C.amber} strokeWidth={2} dot={false} name="Cumulative cost" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 9.5, color: C.dim, marginTop: 4 }}>
            Projection from model assumptions — illustrative, not actuals or financial advice.
          </div>
          <div style={{ marginTop: 10, display: "grid", gap: 4 }}>
            {(fin.flags || []).map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.amber }}>
                <AlertTriangle size={12} />{f}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12, color: C.dim, marginTop: 10 }}>No model yet.</div>
      )}
    </Glass>
  );
}
