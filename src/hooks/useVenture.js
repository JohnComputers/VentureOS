import { useEffect, useState } from "react";
import { watchVenture, watchTasks, watchMemory, watchFeed } from "../lib/store.js";

export function useVenture(uid, vid) {
  const [venture, setVenture] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [memory, setMemory] = useState([]);
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    if (!uid || !vid) {
      setVenture(null); setTasks([]); setMemory([]); setFeed([]);
      return;
    }
    const unsubs = [
      watchVenture(uid, vid, setVenture),
      watchTasks(uid, vid, setTasks),
      watchMemory(uid, vid, setMemory),
      watchFeed(uid, vid, setFeed),
    ];
    return () => unsubs.forEach((u) => u && u());
  }, [uid, vid]);

  return { venture, tasks, memory, feed };
}
