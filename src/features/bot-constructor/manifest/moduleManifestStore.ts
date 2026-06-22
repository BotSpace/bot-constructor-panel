import { create } from "zustand";
import { NodeManifest } from "@/features/bot-constructor/manifest/types";
import {
  registerModuleManifests,
  clearModuleManifests,
} from "@/features/bot-constructor/manifest/manifestStore";

interface ModuleManifestState {
  /** Currently registered module manifests (triggers React re-renders). */
  manifests: NodeManifest[];
  /**
   * Set the full list of module manifests.
   * Updates both the fast synchronous Map (for render-time lookups) and
   * this Zustand store (for React re-renders / nodeTypes diffing).
   */
  setManifests: (manifests: NodeManifest[]) => void;
  /**
   * When true, the constructor polls the module-manifests endpoint every few
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

export const useModuleManifestStore = create<ModuleManifestState>((set) => ({
  manifests: [],
  setManifests: (manifests) => {
    // React Query data is undefined while loading — coerce so the store always
    // holds an array (buildModuleNodeTypes does .reduce on it).
    const safe = Array.isArray(manifests) ? manifests : [];
    clearModuleManifests();
    registerModuleManifests(safe);
    set({ manifests: safe });
  },
  pendingPoll: false,
  startPoll: () => set({ pendingPoll: true }),
  stopPoll: () => set({ pendingPoll: false }),
}));
