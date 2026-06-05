import { db } from "../firebase.js";
import {
  collection, doc, addDoc, setDoc, updateDoc, getDocs,
  onSnapshot, query, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import { AGENTS } from "../config.js";

const vCol = (uid) => collection(db, "users", uid, "ventures");
const vDoc = (uid, vid) => doc(db, "users", uid, "ventures", vid);
const sub = (uid, vid, name) => collection(db, "users", uid, "ventures", vid, name);

const initialAgentStatus = () => {
  const o = {};
  AGENTS.forEach((a) => { o[a.k] = a.active ? "idle" : "standby"; });
  return o;
};

export async function createVenture(uid, config) {
  const ref = await addDoc(vCol(uid), {
    config,
    status: "running",
    cycle: 1,
    sysConfidence: null,
    agentStatus: initialAgentStatus(),
    thesis: null,
    objectives: [],
    riskiestAssumption: null,
    selfCheck: null,
    financials: null,
    verification: null,
    createdAt: serverTimestamp(),
    ts: Date.now(),
  });
  return ref.id;
}

export const updateVenture = (uid, vid, fields) => updateDoc(vDoc(uid, vid), fields);

export const setAgentStatus = (uid, vid, agent, status) =>
  updateDoc(vDoc(uid, vid), { [`agentStatus.${agent}`]: status });

export const addFeed = (uid, vid, entry) =>
  addDoc(sub(uid, vid, "feed"), { ...entry, ts: Date.now(), createdAt: serverTimestamp() });

export const addMemory = (uid, vid, entry) =>
  addDoc(sub(uid, vid, "memory"), { ...entry, ts: Date.now(), createdAt: serverTimestamp() });

export const addTask = (uid, vid, task) =>
  addDoc(sub(uid, vid, "tasks"), { ...task, ts: Date.now(), createdAt: serverTimestamp() });

export const updateTask = (uid, vid, taskId, fields) =>
  updateDoc(doc(db, "users", uid, "ventures", vid, "tasks", taskId), fields);

export async function latestVentureId(uid) {
  const snap = await getDocs(query(vCol(uid), orderBy("ts", "desc"), limit(1)));
  return snap.empty ? null : snap.docs[0].id;
}

// ---- live subscriptions ----
export const watchVenture = (uid, vid, cb) =>
  onSnapshot(vDoc(uid, vid), (d) => cb(d.exists() ? { id: d.id, ...d.data() } : null));

const watchList = (uid, vid, name, dir, cb) =>
  onSnapshot(query(sub(uid, vid, name), orderBy("ts", dir)), (s) =>
    cb(s.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

export const watchTasks = (uid, vid, cb) => watchList(uid, vid, "tasks", "asc", cb);
export const watchMemory = (uid, vid, cb) => watchList(uid, vid, "memory", "desc", cb);
export const watchFeed = (uid, vid, cb) => watchList(uid, vid, "feed", "desc", cb);
