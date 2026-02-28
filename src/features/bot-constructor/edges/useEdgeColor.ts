"use client";

import { useTheme } from "next-themes";

/**
 * Hook to get theme-aware edge colors
 * Dark mode: white edges on dark background
 * Light mode: dark gray edges on light background
 */
export function useEdgeColor() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return {
    /** Default edge stroke color */
    stroke: isDark ? "#fff" : "#a1a1a1",
    /** Selected edge stroke color */
    selectedStroke: "#3b82f6",
  };
}
