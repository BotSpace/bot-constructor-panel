// constructor/store/collabSlice.ts
//
// Real-time collaboration glue for the flow store.
//
//  - `collabBroadcast`  : set by the collab hook; the chokepoint mutations call
//                         it to broadcast LOCAL changes to the project room.
//  - `isApplyingRemote` : guard set while applying an incoming remote op so the
//                         chokepoints do NOT re-broadcast remote changes back.
//  - `applyRemoteOp`    : applies a decoded remote op via `withSilentFlowUpdate`
//                         so it does NOT mark the flow dirty, does NOT pollute
//                         undo/redo, and (together with the guard) does NOT
//                         re-broadcast.

import { StateCreator } from "zustand";
import { addEdge } from "reactflow";
import type { Edge, Node } from "reactflow";
import { FlowStoreState, CollabSlice } from "./types";
import type { CollabOp } from "@/wss/collab/ops";

export const createCollabSlice: StateCreator<
  FlowStoreState,
  [],
  [],
  CollabSlice
> = (set, get) => ({
  isApplyingRemote: false,
  collabBroadcast: null,

  setCollabBroadcast: (fn) => set({ collabBroadcast: fn }),

  /** Broadcast a local op if collab is connected and we're not applying a remote op. */
  emitCollabOp: (op: CollabOp) => {
    const { collabBroadcast, isApplyingRemote, isLoading } = get();
    if (isApplyingRemote || isLoading || !collabBroadcast) return;
    const sent = collabBroadcast(op);
    // Op WS orqali OCHIQ socketga yozildi → server (collab-worker) uni
    // project.flow'ga saqlaydi, shuning uchun o'zgarishni "saqlangan" deb
    // belgilaymiz. Yuborilmasa (socket yopiq) isDirty o'zgarmaydi — 20s periodik
    // safety-net autosave / pagehide flush keyin ushlab qoladi.
    if (sent) set({ isDirty: false, lastSavedTime: new Date() });
  },

  applyRemoteOp: (op: CollabOp) => {
    const { withSilentFlowUpdate } = get();

    set({ isApplyingRemote: true });
    try {
      withSilentFlowUpdate(() => {
        switch (op.t) {
          case "nu": {
            const nodes = get().nodes.map((node) =>
              node.id === op.id
                ? { ...node, data: op.data as Node["data"] }
                : node
            );
            set({ nodes });
            break;
          }
          case "nm": {
            const nodes = get().nodes.map((node) =>
              node.id === op.id ? { ...node, position: op.position } : node
            );
            set({ nodes });
            break;
          }
          case "na": {
            const incoming = op.node as Node;
            if (get().nodes.some((n) => n.id === incoming.id)) break;
            set({ nodes: [...get().nodes, incoming] });
            break;
          }
          case "nd": {
            set({
              nodes: get().nodes.filter((n) => n.id !== op.id),
              // Drop edges attached to the removed node so the canvas stays consistent.
              edges: get().edges.filter(
                (e) => e.source !== op.id && e.target !== op.id
              ),
            });
            break;
          }
          case "ea": {
            const incoming = op.edge as Edge;
            if (get().edges.some((e) => e.id === incoming.id)) break;
            set({ edges: addEdge(incoming, get().edges) });
            break;
          }
          case "ed": {
            set({ edges: get().edges.filter((e) => e.id !== op.id) });
            break;
          }
          default:
            break;
        }
      });
    } finally {
      set({ isApplyingRemote: false });
    }
  },
});
