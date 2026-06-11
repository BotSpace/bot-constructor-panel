"use client";

// useCollab — wires a project's real-time collaboration socket to the flow
// store. Mount it inside the editor (it has the route `[id]` param). On mount
// it opens a dedicated collab WebSocket, registers a broadcaster the store
// chokepoints call for LOCAL changes, and applies REMOTE ops to the canvas.
// Everything is best-effort — failures never break the editor or autosave.

import { useEffect } from "react";
import { useFlowStore } from "@/features/bot-constructor/store";
import { CollabClient } from "./collab-client";

export function useCollab(projectId: string | null | undefined) {
  useEffect(() => {
    if (!projectId) return;

    const store = useFlowStore.getState();
    const client = new CollabClient(projectId, (op) => {
      // Apply incoming remote ops silently (no dirty / no undo / no re-broadcast).
      useFlowStore.getState().applyRemoteOp(op);
    });

    // Register the local-change broadcaster the store chokepoints invoke.
    store.setCollabBroadcast((op) => client.send(op));
    client.start();

    return () => {
      client.stop();
      useFlowStore.getState().setCollabBroadcast(null);
    };
  }, [projectId]);
}
