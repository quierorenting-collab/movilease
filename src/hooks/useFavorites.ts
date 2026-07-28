"use client";

import { useLocalStorageIds } from "@/hooks/useLocalStorageIds";

export function useFavorites() {
  return useLocalStorageIds("movilease:favorites:v1");
}
