# VentureOS — Mission Control

An autonomous **multi-agent venture-reasoning core**. You give it a business idea, budget, skills, time, risk tolerance, and a revenue target; a roster of specialized agents reasons through a founding strategy, **red-teams its own plan and scores its confidence**, **verifies the riskiest assumption against the live web**, models feasibility, and gates anything that spends money or carries legal weight for **your approval**. A continuous improvement loop proposes and scores new experiments over time.

Every agent step is a **real Gemini call**. All state persists in **Firebase Firestore** and reloads across sessions. Runs free as a proof of concept.

> **What this is honest about:** this is a *reasoning and orchestration* system, not a bot that runs a real company unattended. It plans, critiques, verifies, scores, and escalates — it does **not** execute real-world transactions on its own. Anything consequential is held at a human approval gate.

---

## Stack

- **Frontend:** Vite + React (JavaScript), Recharts, lucide-react
- **Backend / persistence:** Firebase Auth (anonymous) + Cloud Firestore
- **AI:** Google **Gemini `gemini-2.5-flash`** (free tier), with **Google Search grounding** for live verification
- **Hosting:** Firebase Hosting or GitHub Pages (static, free)

---

## Prerequisites

- **Node.js 18+** and npm
- A **Google account** (for Firebase + a free Gemini API key)

---

## Setup (about 5 minutes)

### 1. Install

```bash
npm install
```

### 2. Create a Firebase project

1. Go to <https://console.firebase.google.com> → **Add project** (defaults are fine; you can disable Analytics).
2. **Build → Authentication → Get started → Sign-in method →** enable **Anonymous**.
3. **Build → Firestore Database → Create database** → start in **production mode** → pick a region.
4. **Project settings (gear icon) → Your apps → Web app (`</>`)** → register an app → copy the `firebaseConfig` values.

### 3. Add your Firebase config

Copy the example env file and paste your values:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000...:web:...
```

> These Firebase web-config values are **public by design** — security is enforced by Firestore rules + Auth, not by hiding them.

### 4. Deploy the Firestore security rules

The included `firestore.rules` locks every user to their own data (`users/{uid}/...`).

```bash
npm install -g firebase-tools     # if you don't have it
firebase login
firebase use --add                # select your project
firebase deploy --only firestore:rules
```

(Or paste the contents of `firestore.rules` into **Firestore → Rules** in the console and publish.)

### 5. Get a free Gemini API key

1. Go to <https://aistudio.google.com/app/apikey> → **Create API key** (starts with `AIza…`).
2. You paste this **into the app at runtime** (click **set key**). It is stored only in your browser's `localStorage` — never committed to the repo or baked into the bundle.

### 6. Run

```bash
npm run dev
```

Open the local URL, click **set key**, paste your Gemini key, fill in the venture form, and hit **Initialize VentureOS**.

---

## Deploy (free)

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
# or: npm run deploy   (build + deploy in one step)
```

### GitHub Pages

`vite.config.js` already uses `base: "./"` (relative asset paths), so the build works from a subdirectory:

```bash
npm run build
# push the contents of dist/ to your gh-pages branch (e.g. with the `gh-pages` package)
```

> When deploying to a public URL, lock down your **Gemini key** in Google AI Studio / Cloud Console by restricting it to your domain (HTTP referrer restriction) and to the Generative Language API only. The key is visible to anyone who opens the page — that's inherent to any client-only AI app. For a hardened setup, proxy calls through a small server (see below).

---

## Free-tier limits (read this)

- **Gemini free tier** is roughly **10 requests/min** and **500 requests/day** on `gemini-2.5-flash` (Q2 2026).
  - A founding cycle makes **~6 calls**; each improvement cycle makes **~2**. Calls are spaced ~0.8s apart and back off on rate limits, but you can still hit the daily cap with heavy use.
  - Switch `GEMINI_MODEL` in `src/config.js` to `gemini-2.5-flash-lite` for a lighter/faster free option.
- **Firestore free tier (Spark)** is generous for this workload (reads/writes per cycle are small).
- **"Runs forever"** here means *runs while the browser tab is open* (toggle **AUTO** to re-run the loop every 60s). True 24/7 autonomous cycling needs a server — see below.

---

## Going always-on (optional, ~free)

To run the improvement loop on a schedule without a tab open, move `runImprovement` server-side into a **Firebase Cloud Function** triggered by Cloud Scheduler:

```js
// functions/index.js (sketch)
exports.improveLoop = onSchedule("every 24 hours", async () => {
  // for each active venture: call Gemini, run QA score, write task + memory to Firestore
});
```

This requires Firebase's **Blaze (pay-as-you-go)** plan. At low volume it stays at or near $0, but it is not strictly free, and the Gemini key then lives safely on the server instead of in the browser.

---

## How it works

**Founding cycle** (`src/lib/orchestrator.js → runFounding`):

1. **CEO** drafts a thesis, objectives, seed tasks, and the single riskiest assumption.
2. **QA** independently critiques the plan and proposes an alternative.
3. **QA** adjudicates original vs. alternative and **scores confidence 0–100**; below the threshold (70) it **escalates**.
4. **Research** verifies the riskiest assumption with **live Google Search grounding** and returns a verdict + sources.
5. **CFO** builds a rough feasibility model (cost, time-to-revenue, time-to-target).
6. **Risk + Legal** flags which tasks require human approval.

**Improvement loop** (`runImprovement`): **Growth** identifies the top bottleneck and proposes one experiment; **QA** scores it; it becomes a task (auto-approved or gated). Toggle **AUTO** to repeat.

**Approval gates:** any task with `kind` of `spend`, `legal`, or `launch`, or any low-confidence item, lands in the approval queue and never auto-executes.

### Firestore data model

```
users/{uid}/ventures/{ventureId}
  ├─ config, status, cycle, sysConfidence, agentStatus{}
  ├─ thesis, objectives[], riskiestAssumption
  ├─ selfCheck{}, financials{}, verification{}
  ├─ tasks/{taskId}      title, owner, kind, status, needsApproval, conf
  ├─ memory/{memId}      type, text, ts
  └─ feed/{eventId}      agent, text, kind, ts
```

---

## Project structure

```
ventureos/
├─ index.html
├─ package.json
├─ vite.config.js          # base: "./" for subdir-safe static hosting
├─ firebase.json           # hosting + firestore deploy config
├─ firestore.rules         # per-user lockdown
├─ .env.example
└─ src/
   ├─ main.jsx
   ├─ App.jsx              # auth, venture loading, dashboard shell, AUTO loop
   ├─ config.js            # model, threshold, colors, agent roster
   ├─ firebase.js
   ├─ index.css
   ├─ agents/prompts.js    # every agent prompt builder
   ├─ hooks/useVenture.js  # live Firestore subscriptions
   ├─ lib/
   │  ├─ gemini.js         # Gemini wrapper (JSON mode + grounded search + backoff)
   │  ├─ store.js          # Firestore CRUD + watchers
   │  └─ orchestrator.js   # the agent loop (founding + improvement)
   └─ components/          # NetworkField, AgentRoster, CommandView, TaskGraph,
                           # VerificationView, FinancialsView, MemoryView,
                           # ApprovalQueue, Feed, Setup, ui (atoms)
```

---

## Notes & disclaimers

- Anonymous Firebase accounts are **per-browser** — clearing site data or switching devices starts a fresh account (and fresh ventures).
- The financial model is an **illustrative estimate**, not financial advice.
- Verification grounding reflects whatever Google Search returns at call time; treat sources as leads to check, not gospel.
- This is a proof of concept. Building a real, durable, transacting system on top of it means adding a server tier, payment/email integrations behind the same approval gates, and a vector store for semantic memory.

---

Built as a free, single-key proof of concept. Swap the model, wire a server, or extend the agent roster in `src/config.js` to grow it.
