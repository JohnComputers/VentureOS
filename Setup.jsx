import { useState } from "react";
import { Play, Loader2, KeyRound, Check } from "lucide-react";
import { C, MONO, DISPLAY } from "../config.js";
import { Glass, Btn, FieldLabel } from "./ui.jsx";
import { hasGeminiKey, setGeminiKey } from "../lib/gemini.js";

const field = {
  width: "100%", background: "#0d1124", border: `1px solid ${C.border}`, borderRadius: 10,
  padding: "10px 12px", color: C.text, fontFamily: MONO, fontSize: 12.5, boxSizing: "border-box",
};

export default function Setup({ onLaunch, running }) {
  const [cfg, setCfg] = useState({
    idea: "A subscription service that turns long YouTube videos into structured study notes for students.",
    budget: "1500", skills: "web dev, content, some marketing", time: "12", risk: "medium", target: "3000",
  });
  const [keyVal, setKeyVal] = useState("");
  const [keyOk, setKeyOk] = useState(hasGeminiKey());
  const f = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  const saveKey = () => {
    setGeminiKey(keyVal);
    setKeyOk(hasGeminiKey());
  };

  return (
    <Glass style={{ padding: 22, maxWidth: 720, margin: "10px auto" }}>
      <div style={{ fontSize: 13, letterSpacing: 1, color: C.cyan, marginBottom: 4, fontFamily: DISPLAY }}>INITIALIZE VENTURE</div>
      <div style={{ fontSize: 11.5, color: C.dim, marginBottom: 18, lineHeight: 1.5 }}>
        Define the venture parameters. On launch the active agents reason in sequence, QA red-teams the plan and scores
        confidence, Research verifies your riskiest assumption against the live web, and anything that spends money or
        carries legal weight is gated for your approval. All state persists in Firestore.
      </div>

      {!keyOk && (
        <div style={{ marginBottom: 18, padding: 12, borderRadius: 12, background: C.amber + "12", border: `1px solid ${C.amber}44` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, letterSpacing: 1, color: C.amber, fontFamily: DISPLAY, marginBottom: 8 }}>
            <KeyRound size={13} />CONNECT GEMINI
          </div>
          <div style={{ fontSize: 10.5, color: C.dim, marginBottom: 8, lineHeight: 1.5 }}>
            Paste a free Google AI Studio API key (starts with <code>AIza…</code>). Stored only in this browser — never committed or bundled.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={keyVal} onChange={(e) => setKeyVal(e.target.value)} placeholder="AIza..." style={field} type="password" />
            <Btn onClick={saveKey}><Check size={13} />save</Btn>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <FieldLabel>BUSINESS IDEA</FieldLabel>
        <textarea value={cfg.idea} onChange={(e) => f("idea", e.target.value)} rows={3} style={{ ...field, resize: "vertical" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><FieldLabel>BUDGET (USD)</FieldLabel><input value={cfg.budget} onChange={(e) => f("budget", e.target.value)} style={field} /></div>
        <div><FieldLabel>MONTHLY REVENUE TARGET (USD)</FieldLabel><input value={cfg.target} onChange={(e) => f("target", e.target.value)} style={field} /></div>
        <div><FieldLabel>HOURS / WEEK</FieldLabel><input value={cfg.time} onChange={(e) => f("time", e.target.value)} style={field} /></div>
        <div>
          <FieldLabel>RISK TOLERANCE</FieldLabel>
          <select value={cfg.risk} onChange={(e) => f("risk", e.target.value)} style={field}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>SKILLS</FieldLabel>
          <input value={cfg.skills} onChange={(e) => f("skills", e.target.value)} style={field} />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Btn onClick={() => onLaunch(cfg)} disabled={running || !keyOk} big>
          {running ? <Loader2 size={16} style={{ animation: "vspin .9s linear infinite" }} /> : <Play size={16} />}
          {running ? "agents reasoning…" : keyOk ? "INITIALIZE VENTUREOS" : "CONNECT GEMINI TO CONTINUE"}
        </Btn>
      </div>
      <div style={{ fontSize: 9.5, color: C.dim, marginTop: 12, lineHeight: 1.5 }}>
        Each launch makes several live Gemini calls (≈6). This is a reasoning &amp; orchestration core — it does not
        execute real-world transactions on its own.
      </div>
    </Glass>
  );
}
