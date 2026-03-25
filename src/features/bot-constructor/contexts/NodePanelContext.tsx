"use client";

import { createContext, useContext, ReactNode } from "react";

/**
 * Signals that a node component is being rendered inside the
 * NodeEditPanel (not on the ReactFlow canvas).
 * - Handles return null when in panel context
 * - useNodeCollapsed / useNodeExpanded always returns "expanded" in panel
 */
const NodePanelContext = createContext(false);

export const useIsInNodePanel = () => useContext(NodePanelContext);

export function NodePanelProvider({ children }: { children: ReactNode }) {
  return (
    <NodePanelContext.Provider value={true}>
      {children}
    </NodePanelContext.Provider>
  );
}
