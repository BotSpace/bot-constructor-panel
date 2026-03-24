import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useFlowStore } from "../store";

/**
 * Hook that manages node collapsed state with global collapse/expand support.
 * Replaces `useState(false)` for isCollapsed in node components.
 * Listens to global collapseAllSignal and expandAllSignal from the store.
 */
export function useNodeCollapsed(
  defaultValue = true
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [isCollapsed, setIsCollapsed] = useState(defaultValue);
  const collapseAllSignal = useFlowStore(
    (state) => state.collapseAllSignal
  );
  const expandAllSignal = useFlowStore(
    (state) => state.expandAllSignal
  );

  useEffect(() => {
    if (collapseAllSignal > 0) {
      setIsCollapsed(true);
    }
  }, [collapseAllSignal]);

  useEffect(() => {
    if (expandAllSignal > 0) {
      setIsCollapsed(false);
    }
  }, [expandAllSignal]);

  return [isCollapsed, setIsCollapsed];
}

/**
 * Hook that manages node expanded state with global collapse/expand support.
 * Replaces `useState(true)` for isExpanded in node components.
 * Listens to global collapseAllSignal and expandAllSignal from the store.
 */
export function useNodeExpanded(
  defaultValue = false
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [isExpanded, setIsExpanded] = useState(defaultValue);
  const collapseAllSignal = useFlowStore(
    (state) => state.collapseAllSignal
  );
  const expandAllSignal = useFlowStore(
    (state) => state.expandAllSignal
  );

  useEffect(() => {
    if (collapseAllSignal > 0) {
      setIsExpanded(false);
    }
  }, [collapseAllSignal]);

  useEffect(() => {
    if (expandAllSignal > 0) {
      setIsExpanded(true);
    }
  }, [expandAllSignal]);

  return [isExpanded, setIsExpanded];
}
