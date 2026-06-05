import { useState, useEffect, useRef, useCallback } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { Network, KeyRound, Plus, Check, Power } from "lucide-react";
import { auth, firebaseConfigured } from "./firebase.js";
import { C, MONO, DISPLAY, THRESHOLD } from "./config.js";
import { latestVentureId } from "./lib/store.js";
import { runFounding, runImprovement, approveTask, rejectTask } from "./lib/orchestrator.js";
import { hasGeminiKey, setGeminiKey } from "./lib/gemini.js";
import { useVenture } from "./hooks/useVenture.js";

import NetworkField from "./components/NetworkField.jsx";
import { Glass, Btn, ConfRing } from "./components/ui.jsx";
import Setup from "./components/Setup.jsx";
import AgentRoster from "./components/AgentRoster.jsx";
import CommandView from "./components/CommandView.jsx";
import ApprovalQueue from "./components/ApprovalQueue.jsx";
import Feed from "./components/Feed.jsx";
import TaskGraph from "./components/TaskGraph.jsx";
import VerificationView from "./components/VerificationView.jsx";
import FinancialsView from "./components/FinancialsView.jsx";
import MemoryView from "./components/MemoryView.jsx";
import { GitBranch, ScanSearch, DollarSign, Database } from "lucide-react";

const TABS = [
  ["command", "Command", Network],
  ["graph", "Task Graph", GitBranch],
  ["verify", "Verification", ScanSearch],
  ["fin", "Financials", DollarSign],
  ["memory", "Memory", Database],
];

export default function App() {
  const [uid, setUid] = useState(null);
  const [ventureId, setVentureId] = useState(null);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState("command");
  const [auto, setAuto] = useState(false);
  const [keyPanel, setKeyPanel] = useState(false);
  const [keyOk, setKeyOk] = useState(hasGeminiKey());
  const [booted, setBooted] = useState(false);
  const autoRef = useRef(null);

  const { venture, tasks, memory, feed } = useVenture(uid, ventureId);

  // anonymous auth + load latest venture
  useEffect(() => {
    if (!firebaseConfigured) { setBooted(true); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUid(u.uid);
        try {
          const vid = await latestVentureId(u.uid);
          if (vid) setVentureId(vid);
        } catch { /* ignore */ }
      }
      setBooted(true);
    });
    signInAnonymously(auth).catch(() => setBooted(true));
    return () => unsub();
  }, []);

  const handleLaunch = useCallback(async (cfg) => {
    if (!uid) return;
    setRunning(true);
    try {
      const vid = await runFounding(uid, cfg);
      setVentureId(vid);
      setTab("command");
    } finally {
      setRunning(false);
    }
  }, [uid]);

  const handleImprove = useCallback(async () => {
    if (!uid || !ventureId || !venture) return;
    setRunning(true);
    try {
      await runImprovement(uid, ventureId, venture, tasks, memory);
    } finally {
      setRunning(false);
    }
  }, [uid, ventureId, venture, tasks, memory]);

  // auto improvement loop (runs while the tab is open; spaced to respect free-tier limits)
  useEffect(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
    if (auto && ventureId) {
      autoRef.current = setInterval(() => {
        if (!running) handleImprove();
      }, 60000);
    }
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [auto, ventureId, running, handleImprove]);

  const saveKey = (v) => { setGeminiKey(v); setKeyOk(hasGeminiKey()); setKeyPanel(false); };

  const pending = tasks.filter((t) => t.needsApproval && t.status === "awaiting-approval").length;
  const sysConf = venture?.sysConfidence;

  if (!firebaseConfigured) return <FirebaseMissing />;

  return (
    <div style={{ minHeight: "100vh", background: C.ink, color: C.text, fontFamily: MONO, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-15%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${C.violet}22, transparent 70%)`, filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${C.cyan}1c, transparent 70%)`, filter: "blur(40px)" }} />
        <NetworkField />
      </div>

      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", padding: "20px 16px 60px" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${C.violet}, ${C.cyan})`, display: "grid", placeItems: "center", boxShadow: `0 0 24px ${C.cyan}55` }}>
              <Network size={22} color={C.ink} />
            </div>
            <div>
              <div style={{ fontSize: 17, letterSpacing: 2, fontWeight: 700, fontFamily: DISPLAY }}>
                VENTURE<span style={{ color: C.cyan }}>OS</span>
              </div>
              <div style={{ fontSize: 10, color: C.dim, letterSpacing: 3, fontFamily: DISPLAY }}>
                MISSION CONTROL // {venture ? `CYCLE ${venture.cycle || 1}` : "STANDBY"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            {venture && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ConfRing v={sysConf} size={34} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: DISPLAY, color: sysConf == null ? C.dim : sysConf >= THRESHOLD ? C.green : C.amber }}>
                      {sysConf == null ? "—" : sysConf + "%"}
                    </div>
                    <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, fontFamily: DISPLAY }}>SYS CONFIDENCE</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: DISPLAY, color: pending ? C.amber : C.green }}>{pending}</div>
                  <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, fontFamily: DISPLAY }}>PENDING GATES</div>
                </div>
              </>
            )}
            <Btn ghost tiny onClick={() => setKeyPanel(true)}>
              <KeyRound size={12} color={keyOk ? C.green : C.amber} />{keyOk ? "key set" : "set key"}
            </Btn>
            {venture && <Btn ghost tiny onClick={() => { setVentureId(null); setAuto(false); }}><Plus size={12} />new</Btn>}
          </div>
        </div>

        {/* body */}
        {!booted ? (
          <div style={{ fontSize: 12, color: C.dim, textAlign: "center", padding: 40 }}>connecting…</div>
        ) : !ventureId ? (
          <Setup onLaunch={handleLaunch} running={running} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr)", gap: 14 }} className="vos-grid">
            <AgentRoster agentStatus={venture?.agentStatus} />

            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                {TABS.map(([id, label, Icon]) => (
                  <button key={id} onClick={() => setTab(id)} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10,
                    fontSize: 11, letterSpacing: 1, fontFamily: DISPLAY, cursor: "pointer",
                    background: tab === id ? `linear-gradient(135deg, ${C.violet}33, ${C.cyan}22)` : "transparent",
                    border: `1px solid ${tab === id ? C.cyan + "66" : C.border}`,
                    color: tab === id ? "#fff" : C.dim,
                  }}>
                    <Icon size={13} />{label}
                  </button>
                ))}
                <button onClick={() => setAuto((a) => !a)} title="Auto-run improvement loop every 60s while open" style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, marginLeft: "auto",
                  fontSize: 11, letterSpacing: 1, fontFamily: DISPLAY, cursor: "pointer",
                  background: auto ? C.green + "1c" : "transparent",
                  border: `1px solid ${auto ? C.green + "66" : C.border}`, color: auto ? C.green : C.dim,
                }}>
                  <Power size={13} />AUTO {auto ? "ON" : "OFF"}
                </button>
              </div>

              {tab === "command" && (
                <div style={{ display: "grid", gap: 14 }}>
                  <CommandView venture={venture} running={running} onRefound={() => { setVentureId(null); setAuto(false); }} onImprove={handleImprove} />
                  <ApprovalQueue tasks={tasks} onApprove={(t) => approveTask(uid, ventureId, t)} onReject={(t) => rejectTask(uid, ventureId, t)} />
                  <Feed feed={feed} />
                </div>
              )}
              {tab === "graph" && <TaskGraph tasks={tasks} />}
              {tab === "verify" && <VerificationView verification={venture?.verification} />}
              {tab === "fin" && <FinancialsView financials={venture?.financials} target={venture?.config?.target} />}
              {tab === "memory" && <MemoryView memory={memory} />}
            </div>
          </div>
        )}
      </div>

      {keyPanel && <KeyPanel onSave={saveKey} onClose={() => setKeyPanel(false)} hasKey={keyOk} />}
    </div>
  );
}

function KeyPanel({ onSave, onClose, hasKey }) {
  const [v, setV] = useState("");
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(4,5,12,0.7)", display: "grid", placeItems: "center", zIndex: 50, padding: 16 }}>
      <Glass style={{ padding: 20, maxWidth: 420, width: "100%" }}>
        <div onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, letterSpacing: 1, color: C.cyan, fontFamily: DISPLAY, marginBottom: 8 }}>
            <KeyRound size={14} />GEMINI API KEY {hasKey && <span style={{ color: C.green, fontSize: 10 }}>· connected</span>}
          </div>
          <div style={{ fontSize: 10.5, color: C.dim, marginBottom: 10, lineHeight: 1.5 }}>
            Free key from Google AI Studio (aistudio.google.com). Stored only in this browser's localStorage.
          </div>
          <input value={v} onChange={(e) => setV(e.target.value)} placeholder="AIza..." type="password"
            style={{ width: "100%", boxSizing: "border-box", background: "#0d1124", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontFamily: MONO, fontSize: 12.5, marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn ghost onClick={onClose}>cancel</Btn>
            <Btn onClick={() => onSave(v)}><Check size={13} />save</Btn>
          </div>
        </div>
      </Glass>
    </div>
  );
}

function FirebaseMissing() {
  return (
    <div style={{ minHeight: "100vh", background: C.ink, color: C.text, fontFamily: MONO, display: "grid", placeItems: "center", padding: 24 }}>
      <Glass style={{ padding: 26, maxWidth: 520 }}>
        <div style={{ fontSize: 14, color: C.amber, fontFamily: DISPLAY, letterSpacing: 1, marginBottom: 10 }}>FIREBASE NOT CONFIGURED</div>
        <div style={{ fontSize: 12.5, color: "#c2cae8", lineHeight: 1.6 }}>
          Copy <code>.env.example</code> to <code>.env</code> and fill in your Firebase web config
          (Project settings → Your apps → Web app), then restart <code>npm run dev</code>. Full steps are in the README.
        </div>
      </Glass>
    </div>
  );
}
