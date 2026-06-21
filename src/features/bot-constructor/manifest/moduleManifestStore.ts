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
}));
