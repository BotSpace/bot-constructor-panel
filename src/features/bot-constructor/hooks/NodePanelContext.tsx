"use client";

import { createContext, useContext, ReactNode } from "react";

/**
 * Signals that a node component is being rendered inside an edit surface
 * (modal/sidebar), not on the ReactFlow canvas.
 * - Handles return null in edit context
 * - useNodeCollapsed / useNodeExpanded always returns "expanded" in edit context
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
