"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Lista de IDs (favoritos, comparador...) persistida en localStorage, sin
 * necesidad de cuenta de usuario. `max` limita cuántos elementos caben (el
 * comparador se limita a 3; favoritos no tiene límite).
 */
export function useLocalStorageIds(storageKey: string, max?: number) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      setIds(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setIds([]);
    }
    setHydrated(true);
  }, [storageKey]);

  const persist = useCallback(
    (next: string[]) => {
      setIds(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // localStorage no disponible (modo privado, cuota llena...): se
        // pierde la persistencia pero la sesión actual sigue funcionando.
      }
    },
    [storageKey]
  );

  const toggle = useCallback(
    (id: string) => {
      const next = ids.includes(id)
        ? ids.filter((existing) => existing !== id)
        : max && ids.length >= max
          ? ids
          : [...ids, id];
      persist(next);
    },
    [ids, max, persist]
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const clear = useCallback(() => persist([]), [persist]);

  return { ids, hydrated, toggle, has, clear, isFull: Boolean(max && ids.length >= max) };
}
