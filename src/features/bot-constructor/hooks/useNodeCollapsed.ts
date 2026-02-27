import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useFlowStore } from "../store";

/**
 * Hook that manages node collapsed state with global collapse support.
 * Replaces `useState(false)` for isCollapsed in node components.
 * Listens to global collapseAllSignal from the store.
 */
export function useNodeCollapsed(
  defaultValue = false
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [isCollapsed, setIsCollapsed] = useState(defaultValue);
  const collapseAllSignal = useFlowStore(
    (state) => state.collapseAllSignal
  );

  useEffect(() => {
    if (collapseAllSignal > 0) {
      setIsCollapsed(true);
    }
  }, [collapseAllSignal]);

  return [isCollapsed, setIsCollapsed];
}

/**
 * Hook that manages node expanded state with global collapse support.
 * Replaces `useState(true)` for isExpanded in node components.
 * Listens to global collapseAllSignal from the store.
 */
export function useNodeExpanded(
  defaultValue = true
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [isExpanded, setIsExpanded] = useState(defaultValue);
  const collapseAllSignal = useFlowStore(
    (state) => state.collapseAllSignal
  );

  useEffect(() => {
    if (collapseAllSignal > 0) {
      setIsExpanded(false);
    }
  }, [collapseAllSignal]);

  return [isExpanded, setIsExpanded];
}
