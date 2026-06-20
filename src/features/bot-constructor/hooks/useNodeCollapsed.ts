import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useIsInNodePanel } from "@/features/bot-constructor/hooks/NodePanelContext";

/**
 * Canvas mode  → always returns [true, noop]  (node stays compact)
 * Panel mode   → returns [false, setter]       (node starts expanded)
 * Global collapseAll / expandAll signals still work inside the panel.
 */
export function useNodeCollapsed(
  _defaultValue = true
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const inPanel = useIsInNodePanel();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const collapseAllSignal = useFlowStore((state) => state.collapseAllSignal);
  const expandAllSignal = useFlowStore((state) => state.expandAllSignal);

  useEffect(() => {
    if (collapseAllSignal > 0) setIsCollapsed(true);
  }, [collapseAllSignal]);

  useEffect(() => {
    if (expandAllSignal > 0) setIsCollapsed(false);
  }, [expandAllSignal]);

  // On canvas: node is always compact — toggle does nothing
  if (!inPanel) return [true, () => {}];

  return [isCollapsed, setIsCollapsed];
}

/**
 * Canvas mode  → always returns [false, noop]  (node stays compact)
 * Panel mode   → returns [true, setter]         (node starts expanded)
 */
export function useNodeExpanded(
  _defaultValue = false
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const inPanel = useIsInNodePanel();
  const [isExpanded, setIsExpanded] = useState(true);

  const collapseAllSignal = useFlowStore((state) => state.collapseAllSignal);
  const expandAllSignal = useFlowStore((state) => state.expandAllSignal);

  useEffect(() => {
    if (collapseAllSignal > 0) setIsExpanded(false);
  }, [collapseAllSignal]);

  useEffect(() => {
    if (expandAllSignal > 0) setIsExpanded(true);
  }, [expandAllSignal]);

  // On canvas: always compact
  if (!inPanel) return [false, () => {}];

  return [isExpanded, setIsExpanded];
}
