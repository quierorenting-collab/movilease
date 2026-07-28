"use client";

import { useLocalStorageIds } from "@/hooks/useLocalStorageIds";

export const MAX_COMPARISON_ITEMS = 3;

export function useComparison() {
  return useLocalStorageIds("movilease:comparison:v1", MAX_COMPARISON_ITEMS);
}
