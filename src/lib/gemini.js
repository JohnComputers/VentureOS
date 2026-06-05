import { GEMINI_ENDPOINT } from "../config.js";

const KEY_STORE = "ventureos_gemini_key";

export const getGeminiKey = () => {
  try { return localStorage.getItem(KEY_STORE) || ""; } catch { return ""; }
};
export const setGeminiKey = (k) => {
  try { localStorage.setItem(KEY_STORE, (k || "").trim()); } catch { /* ignore */ }
};
export const hasGeminiKey = () => getGeminiKey().length > 10;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Low-level Gemini call.
 * @param {string} prompt
 * @param {object} opts { json?: boolean, search?: boolean, maxTokens?: number }
 * @returns {Promise<{ text: string, sources: {uri:string,title:string}[] }>}
 *
 * Note: forced-JSON output (responseMimeType) cannot be combined with the
 * google_search grounding tool, so when `search` is on we request JSON in the
 * prompt and parse it loosely instead.
 */
export async function callGemini(prompt, opts = {}) {
  const { json = true, search = false, maxTokens = 900 } = opts;
  const key = getGeminiKey();
  if (!key) throw new Error("No Gemini API key set");

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.5, maxOutputTokens: maxTokens },
  };
  if (search) {
    body.tools = [{ google_search: {} }];
  } else if (json) {
    body.generationConfig.responseMimeType = "application/json";
  }

  const doFetch = () =>
    fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
    });

  let res = await doFetch();
  if (res.status === 429) {
    await sleep(4000); // one polite backoff on rate limit
    res = await doFetch();
  }
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json())?.error?.message || ""; } catch { /* ignore */ }
    if (res.status === 429) throw new Error("Gemini rate limit hit (free tier is ~10/min). Wait a moment and retry.");
    if (res.status === 400) throw new Error("Gemini rejected the request (check your API key). " + detail);
    throw new Error(`Gemini error ${res.status}. ${detail}`);
  }

  const data = await res.json();
  const cand = data.candidates?.[0];
  const text = (cand?.content?.parts || []).map((p) => p.text).filter(Boolean).join("\n");
  const sources = (cand?.groundingMetadata?.groundingChunks || [])
    .map((c) => c.web)
    .filter(Boolean)
    .map((w) => ({ uri: w.uri, title: w.title || w.uri }));
  return { text: text || "", sources };
}

function extractJSON(text) {
  if (!text) return null;
  let t = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s !== -1 && e !== -1) t = t.slice(s, e + 1);
  try { return JSON.parse(t); } catch { return null; }
}

/**
 * High-level helper: returns parsed JSON object (or null), plus any sources.
 */
export async function geminiJSON(prompt, opts = {}) {
  const r = await callGemini(prompt, opts);
  let parsed = extractJSON(r.text);
  if (!parsed) {
    const r2 = await callGemini(
      prompt + "\n\nReturn ONLY valid minified JSON. No prose, no markdown fences.",
      { ...opts, search: false } // retry without tools to allow strict JSON
    );
    parsed = extractJSON(r2.text);
  }
  return { data: parsed, sources: r.sources };
}
