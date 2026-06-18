"use client";

import { useTheme } from "next-themes";

/**
 * Hook to get theme-aware edge colors with handle type support
 * Dark mode: white edges on dark background
 * Light mode: dark gray edges on light background
 * 
 * Handle types:
 * - default/next: Blue (main flow)
 * - true/success: Green (success path)
 * - false/error: Red (error path)
 */
export function useEdgeColor(sourceHandle?: string | null) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Determine color based on handle type
  let stroke: string;
  let selectedStroke: string;

  if (sourceHandle?.includes("true") || sourceHandle?.includes("success")) {
    // Success/True path - Green
    stroke = isDark ? "#10b981" : "#059669"; // emerald-500 / emerald-600
    selectedStroke = "#22c55e"; // green-500
  } else if (sourceHandle?.includes("false") || sourceHandle?.includes("error") || sourceHandle?.includes("fail")) {
    // Error/False path - Red
    stroke = isDark ? "#ef4444" : "#dc2626"; // red-500 / red-600
    selectedStroke = "#f87171"; // red-400
  } else if (sourceHandle?.includes("next") || sourceHandle?.includes("default")) {
    // Next/Default path - Blue
    stroke = isDark ? "#3b82f6" : "#2563eb"; // blue-500 / blue-600
    selectedStroke = "#60a5fa"; // blue-400
  } else {
    // Generic path - Gray
    stroke = isDark ? "#9ca3af" : "#6b7280"; // gray-400 / gray-500
    selectedStroke = "#3b82f6"; // blue-500
  }

  // Neutral (accessory) edge color — matches the generic/default edge so
  // accessory edges (AI tool/provider connectors) are visually consistent with
  // regular flow edges rather than standing out as blue.
  const neutralStroke = isDark ? "#9ca3af" : "#6b7280"; // gray-400 / gray-500

  return {
    /** Default edge stroke color */
    stroke,
    /** Selected edge stroke color */
    selectedStroke,
    /** Neutral color for accessory / non-semantic edges */
    neutralStroke,
  };
}
