// Every prompt asks for a tight, strictly-shaped JSON object. For non-grounded
// calls we also set responseMimeType=application/json (see gemini.js), so these
// reliably parse. The grounded Research call parses JSON loosely from text.

export const ctxBlock = (c) =>
  `Idea: ${c.idea}
Budget: $${c.budget}
Founder skills: ${c.skills}
Time available: ${c.time} h/week
Risk tolerance: ${c.risk}
Monthly revenue target: $${c.target}`;

export const ceoPrompt = (c) =>
`You are the CEO agent of VentureOS, an autonomous venture-building system.
${ctxBlock(c)}

Produce a tight founding strategy as JSON with EXACTLY this shape:
{"thesis":"one crisp sentence","objectives":["o1","o2","o3"],"riskiestAssumption":"the single most important factual claim worth verifying with a web search","tasks":[{"title":"short imperative","owner":"CTO|CMO|Sales|Growth|Automation|COO","kind":"build|market|spend|legal|research|ops","est":"e.g. 1 week"}]}

Rules: max 3 objectives, max 5 tasks. kind 'spend' = anything that costs money; 'legal' = contracts/compliance. Owner must be one of the listed roles.`;

export const qaCritiquePrompt = (strategy) =>
`You are the QA / red-team agent. Independently and skeptically critique this founding strategy, then propose ONE materially different alternative direction.
Strategy: ${JSON.stringify(strategy)}

Respond as JSON: {"weaknesses":["w1","w2"],"blindSpots":["b1"],"alternative":"1-2 sentence genuinely different approach"}`;

export const qaAdjudicatePrompt = (thesis, critique, threshold) =>
`You are the QA adjudicator. Weigh the original plan against the critique and alternative, decide how to proceed, and score confidence 0-100.
Original thesis: "${thesis}"
Critique & alternative: ${JSON.stringify(critique || {})}

Respond as JSON: {"chosen":"original|alternative|hybrid","confidence":0,"rationale":"one sentence","escalate":true}
Set escalate=true if confidence < ${threshold} or there is material uncertainty.`;

export const researchVerifyPrompt = (assumption) =>
`You are the Research agent with live Google Search. Verify this business assumption using current information: "${assumption}".
Search the web, then judge how well the evidence supports it.
End your reply with ONLY a JSON object (no markdown): {"verdict":"supported|mixed|refuted|uncertain","evidence":"1-2 sentences citing what you actually found","confidence":0}`;

export const cfoPrompt = (c) =>
`You are the CFO agent. Build a rough feasibility model (estimates, clearly not guarantees).
${ctxBlock(c)}

Respond as JSON: {"estMonthlyCost":0,"estMonthsToFirstRevenue":1,"estMonthsToTarget":6,"feasibility":"low|medium|high","flags":["one risk"],"assumptions":["one assumption"]}
estMonthlyCost in USD. Months are integers.`;

export const riskPrompt = (tasks, idea) =>
`You are the combined Risk + Legal agent.
Idea: ${idea}
Tasks: ${JSON.stringify(tasks)}

Identify which task titles must get explicit human approval before executing, and any compliance flags.
Respond as JSON: {"mustApprove":["exact task title"],"legalFlags":["short flag"],"overallRisk":"low|medium|high"}`;

export const growthPrompt = (state) =>
`You are the Growth agent running VentureOS's continuous improvement loop.
Objectives: ${JSON.stringify(state.objectives || [])}
Open tasks: ${JSON.stringify(state.openTasks || [])}
Recent lessons: ${JSON.stringify(state.lessons || [])}
Last system confidence: ${state.sysConfidence}

Find the single biggest current bottleneck and propose ONE concrete experiment to address it.
Respond as JSON: {"bottleneck":"...","experiment":{"title":"short imperative","hypothesis":"...","metric":"the number you'd watch","owner":"CMO|Sales|Growth|CTO|Automation","kind":"build|market|spend|research|ops"},"expectedLift":"..."}`;

export const qaScoreExperimentPrompt = (experiment, lift, threshold) =>
`You are QA. Score this proposed experiment 0-100 for VentureOS and decide whether it needs human sign-off.
Experiment: ${JSON.stringify(experiment)}
Expected lift: ${lift}

Respond as JSON: {"confidence":0,"rationale":"one sentence","escalate":true}
Set escalate=true if confidence < ${threshold} or the experiment spends money / has legal exposure.`;
