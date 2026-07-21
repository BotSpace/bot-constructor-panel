import { create } from "zustand";
import { NodeManifest } from "@/features/bot-constructor/manifest/types";
import {
  registerNodeManifests,
  clearNodeManifests,
} from "@/features/bot-constructor/manifest/manifestStore";

interface ModuleManifestState {
  /** Backend-provided unified manifests (triggers React re-renders). */
  manifests: NodeManifest[];
  /**
   * Set the full built-in + module manifest list.
   * Updates both the fast synchronous Map (for render-time lookups) and
   * this Zustand store (for React re-renders / nodeTypes diffing).
   */
  setManifests: (manifests: NodeManifest[]) => void;
  /**
   * When true, the constructor polls the node-manifests endpoint every few
   * seconds.  Set to true after install/enable/disable so newly deployed
   * modules appear in the sidebar without a full page reload.
   * The constructor resets this to false once it detects the manifest count
   * has stabilised (no change between two consecutive fetches).
   */
  pendingPoll: boolean;
  /** Start polling — call after a successful install / enable / disable. */
  startPoll: () => void;
  /** Stop polling — called by the constructor once manifests are stable. */
  stopPoll: () => void;
}

// Preserve the array reference while the backend payload is unchanged so ReactFlow
// does not remount every node during module deployment polling.
const manifestSignature = (arr: NodeManifest[]): string =>
  JSON.stringify(arr);

export const useModuleManifestStore = create<ModuleManifestState>((set, get) => ({
  manifests: [],
  setManifests: (manifests) => {
    // React Query data is undefined while loading — coerce so the store always
    // holds an array (buildModuleNodeTypes does .reduce on it).
    const safe = Array.isArray(manifests) ? manifests : [];
    if (manifestSignature(safe) === manifestSignature(get().manifests)) {
      // Same module node types — keep the reference stable so nodeTypes (and every
      // node) does not remount. The lookup Map already holds these from the prior call.
      return;
    }
    clearNodeManifests();
    registerNodeManifests(safe);
    set({ manifests: safe });
  },
  pendingPoll: false,
  startPoll: () => set({ pendingPoll: true }),
  stopPoll: () => set({ pendingPoll: false }),
}));
