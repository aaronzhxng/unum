import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const MAX = 8;
const storageKey = (key: string) => `search_history:${key}`;

/**
 * Recent searches for one screen's search, newest first, kept on the phone.
 * A search counts once a result is opened or the search key is pressed. With
 * no key, nothing is kept.
 */
export function useSearchHistory(key?: string) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (!key) return;
    AsyncStorage.getItem(storageKey(key))
      .then((raw) => {
        const list = raw ? JSON.parse(raw) : [];
        if (Array.isArray(list)) setHistory(list.filter((q) => typeof q === "string"));
      })
      .catch(() => {});
  }, [key]);

  const update = useCallback(
    (change: (list: string[]) => string[]) => {
      if (!key) return;
      setHistory((list) => {
        const next = change(list);
        AsyncStorage.setItem(storageKey(key), JSON.stringify(next)).catch(
          () => {},
        );
        return next;
      });
    },
    [key],
  );

  const add = useCallback(
    (query: string) => {
      const q = query.trim().replace(/\s+/g, " ");
      if (q.length < 2) return;
      update((list) =>
        [q, ...list.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(
          0,
          MAX,
        ),
      );
    },
    [update],
  );
  const remove = useCallback(
    (query: string) => update((list) => list.filter((x) => x !== query)),
    [update],
  );
  const clear = useCallback(() => update(() => []), [update]);

  return { history, add, remove, clear };
}
