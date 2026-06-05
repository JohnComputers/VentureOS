import { geminiJSON } from "./gemini.js";
import * as store from "./store.js";
import * as P from "../agents/prompts.js";
import { THRESHOLD, CALL_SPACING_MS, isConsequential, sleep } from "../config.js";

// Run a single agent step: set status -> log -> call -> log -> set status.
async function step(uid, vid, agent, label, prompt, opts = {}) {
  await store.setAgentStatus(uid, vid, agent, "thinking");
  await store.addFeed(uid, vid, { agent, text: `${label}…`, kind: "work" });
  try {
    const { data, sources } = await geminiJSON(prompt, opts);
    if (!data) {
      await store.setAgentStatus(uid, vid, agent, "error");
      await store.addFeed(uid, vid, { agent, text: "output unparseable — skipped", kind: "error" });
      return { data: null, sources: [] };
    }
    await store.setAgentStatus(uid, vid, agent, "done");
    await sleep(CALL_SPACING_MS); // respect free-tier RPM
    return { data, sources };
  } catch (e) {
    await store.setAgentStatus(uid, vid, agent, "error");
    await store.addFeed(uid, vid, { agent, text: "call failed: " + (e?.message || "network"), kind: "error" });
    throw e;
  }
}

/**
 * Founding cycle. Creates the venture, then runs:
 * CEO strategy -> QA critique -> QA adjudicate (confidence) ->
 * Research live verification -> CFO model -> Risk/Legal gating.
 * Returns the new venture id.
 */
export async function runFounding(uid, config) {
  const vid = await store.createVenture(uid, config);

  // 1. CEO strategy
  const { data: strat } = await step(uid, vid, "CEO", "drafting founding thesis", P.ceoPrompt(config));
  if (!strat) {
    await store.updateVenture(uid, vid, { status: "live" });
    return vid;
  }
  const seeded = (strat.tasks || []).slice(0, 6).map((t) => ({
    title: t.title,
    owner: t.owner || "COO",
    kind: t.kind || "ops",
    est: t.est || "",
    status: isConsequential(t.kind) ? "awaiting-approval" : "approved",
    needsApproval: isConsequential(t.kind),
    source: "strategy",
    conf: null,
  }));
  await store.updateVenture(uid, vid, {
    thesis: strat.thesis,
    objectives: strat.objectives || [],
    riskiestAssumption: strat.riskiestAssumption || null,
  });
  await store.addFeed(uid, vid, { agent: "CEO", text: strat.thesis, kind: "out" });
  await store.addMemory(uid, vid, { type: "decision", text: "Founding thesis: " + strat.thesis });
  for (const t of seeded) await store.addTask(uid, vid, t);

  // 2. QA red-team critique + alternative
  const { data: crit } = await step(uid, vid, "QA", "red-teaming the thesis", P.qaCritiquePrompt(strat));

  // 3. QA adjudicate + confidence score
  const { data: adj } = await step(
    uid, vid, "QA", "adjudicating + scoring confidence",
    P.qaAdjudicatePrompt(strat.thesis, crit, THRESHOLD)
  );
  if (adj) {
    const escalate = !!adj.escalate;
    await store.updateVenture(uid, vid, {
      selfCheck: { ...adj, critique: crit || null },
      sysConfidence: adj.confidence ?? null,
      "agentStatus.QA": escalate ? "escalated" : "done",
    });
    await store.addFeed(uid, vid, {
      agent: "QA",
      text: `verdict: ${adj.chosen} @ ${adj.confidence}% — ${adj.rationale}`,
      kind: escalate ? "warn" : "out",
    });
    await store.addMemory(uid, vid, {
      type: escalate ? "escalation" : "lesson",
      text: `Self-check: proceed with ${adj.chosen} (${adj.confidence}%). ${adj.rationale}`,
    });
    if (escalate)
      await store.addFeed(uid, vid, { agent: "QA", text: `confidence below ${THRESHOLD}% → flagged for human review`, kind: "warn" });
  }

  // 4. Research live verification (grounded search)
  if (strat.riskiestAssumption) {
    try {
      const { data: v, sources } = await step(
        uid, vid, "Research", "verifying riskiest assumption (live search)",
        P.researchVerifyPrompt(strat.riskiestAssumption),
        { search: true, json: false }
      );
      if (v) {
        const verification = {
          claim: strat.riskiestAssumption,
          verdict: v.verdict,
          evidence: v.evidence,
          confidence: v.confidence,
          sources: sources.slice(0, 4),
        };
        await store.updateVenture(uid, vid, { verification });
        await store.addFeed(uid, vid, {
          agent: "Research",
          text: `${String(v.verdict).toUpperCase()} @ ${v.confidence}% — ${v.evidence}`,
          kind: v.verdict === "refuted" ? "warn" : "out",
        });
        await store.addMemory(uid, vid, {
          type: "verification",
          text: `${strat.riskiestAssumption} → ${v.verdict} (${v.confidence}%)`,
        });
      }
    } catch { /* verification failure already logged */ }
  }

  // 5. CFO feasibility model
  try {
    const { data: f } = await step(uid, vid, "CFO", "modelling runway & feasibility", P.cfoPrompt(config));
    if (f) {
      await store.updateVenture(uid, vid, { financials: f });
      await store.addFeed(uid, vid, {
        agent: "CFO",
        text: `feasibility: ${f.feasibility} · ~$${f.estMonthlyCost}/mo · ~${f.estMonthsToTarget}mo to target`,
        kind: f.feasibility === "low" ? "warn" : "out",
      });
      await store.addMemory(uid, vid, {
        type: "decision",
        text: `CFO model: ${f.feasibility} feasibility, $${f.estMonthlyCost}/mo, ${f.estMonthsToTarget}mo to $${config.target}`,
      });
    }
  } catch { /* logged */ }

  // 6. Risk + Legal gating
  try {
    const titles = seeded.map((t) => ({ title: t.title, kind: t.kind }));
    const { data: r } = await step(uid, vid, "Risk", "scoring risk & compliance gates", P.riskPrompt(titles, config.idea));
    if (r) {
      await store.setAgentStatus(uid, vid, "Risk",
        r.overallRisk === "high" ? "escalated" : "done");
      await store.addFeed(uid, vid, {
        agent: "Risk",
        text: `overall risk: ${r.overallRisk} · ${(r.legalFlags || []).length} legal flag(s)`,
        kind: r.overallRisk === "high" ? "warn" : "out",
      });
      for (const fl of r.legalFlags || [])
        await store.addMemory(uid, vid, { type: "risk", text: "Legal flag: " + fl });
    }
  } catch { /* logged */ }

  await store.updateVenture(uid, vid, { status: "live" });
  await store.addFeed(uid, vid, { agent: "SYSTEM", text: "founding cycle complete — awaiting approvals where flagged", kind: "out" });
  return vid;
}

/**
 * Improvement loop: Growth proposes one experiment, QA scores it, a task is
 * created (gated if low-confidence or consequential).
 */
export async function runImprovement(uid, vid, venture, tasks, memory) {
  const n = (venture.cycle || 1) + 1;
  await store.updateVenture(uid, vid, { cycle: n });

  const state = {
    objectives: venture.objectives,
    openTasks: tasks.filter((t) => t.status !== "done").map((t) => t.title),
    lessons: (memory || []).slice(0, 6).map((m) => m.text),
    sysConfidence: venture.sysConfidence,
  };

  const { data: g } = await step(uid, vid, "Growth", `improvement cycle ${n}: proposing experiment`, P.growthPrompt(state));
  if (!g) return;
  await store.addFeed(uid, vid, { agent: "Growth", text: "bottleneck: " + g.bottleneck, kind: "out" });

  const ex = g.experiment || {};
  const { data: adj } = await step(uid, vid, "QA", "scoring the experiment", P.qaScoreExperimentPrompt(ex, g.expectedLift, THRESHOLD));
  const conf = adj?.confidence ?? 0;
  const gate = !!adj?.escalate || isConsequential(ex.kind) || conf < THRESHOLD;

  await store.addTask(uid, vid, {
    title: ex.title || "Experiment",
    owner: ex.owner || "Growth",
    kind: ex.kind || "ops",
    est: ex.metric ? "metric: " + ex.metric : "",
    status: gate ? "awaiting-approval" : "approved",
    needsApproval: gate,
    source: "loop",
    conf,
    hypothesis: ex.hypothesis || "",
  });
  if (adj) await store.updateVenture(uid, vid, { sysConfidence: conf });
  await store.addFeed(uid, vid, {
    agent: "QA",
    text: `experiment scored ${conf}% — ${gate ? "needs approval" : "auto-approved"}`,
    kind: gate ? "warn" : "out",
  });
  await store.addMemory(uid, vid, {
    type: gate ? "escalation" : "lesson",
    text: `Cycle ${n}: ${ex.title} (${conf}%). ${adj?.rationale || ""}`,
  });
}

export async function approveTask(uid, vid, task) {
  await store.updateTask(uid, vid, task.id, { status: "done", needsApproval: false });
  await store.addFeed(uid, vid, { agent: "HUMAN", text: "approved: " + task.title, kind: "out" });
  await store.addMemory(uid, vid, { type: "decision", text: "Human approved: " + task.title });
}
export async function rejectTask(uid, vid, task) {
  await store.updateTask(uid, vid, task.id, { status: "rejected", needsApproval: false });
  await store.addFeed(uid, vid, { agent: "HUMAN", text: "rejected: " + task.title, kind: "warn" });
  await store.addMemory(uid, vid, { type: "decision", text: "Human rejected: " + task.title });
}
