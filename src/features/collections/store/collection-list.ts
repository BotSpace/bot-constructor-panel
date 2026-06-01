import { CollectionListItem } from "@/types/http/collection";
import { create } from "zustand";
import { instanceAuth } from "@/services/instance";
import toast from "react-hot-toast";

// The cms collections endpoint returns the paginated body DIRECTLY
// ({ results: [{id, name, ...}], total_items, ... }). Some endpoints instead
// wrap it as { status, data: {...} } or { status, data: [...] }. Be robust to
// all shapes — the previous code read raw.data.results and crashed on the bare
// { results } body (raw.data was undefined → "ma'lumot yuklashda xatolik").
type CmsCollectionRaw = {
  _id?: string;
  id?: string | number;
  name: string;
  [key: string]: unknown;
};

function extractCollections(raw: unknown): CollectionListItem[] {
  const r = (raw ?? {}) as Record<string, unknown>;
  const data = r.data as Record<string, unknown> | unknown[] | undefined;
  const candidates: unknown[] = [
    r.results, // { results: [...] }  (paginated body, the actual shape)
    (data as Record<string, unknown> | undefined)?.results, // { data: { results: [...] } }
    data, // { data: [...] }
    raw, // bare array
  ];
  const items = (candidates.find(Array.isArray) as CmsCollectionRaw[] | undefined) ?? [];
  return items
    .filter((item) => item && typeof item.name === "string")
    .map((item) => ({
      id: item.id ?? item._id ?? item.name,
      name: item.name,
    }));
}

type CollectionStore = {
  data: CollectionListItem[] | null;
  loading: boolean;
  loadCollections: (project_id: string) => void;
  changeData: (data: CollectionListItem[]) => void;
};

export const useCollectionStore = create<CollectionStore>((set) => ({
  data: null,
  loading: true,

  // Load collections from cms app (Mongo — agent-created, engine-used)
  loadCollections(project_id) {
    set({ loading: true });

    instanceAuth
      .get(`/cms/projects/${project_id}/collections/`)
      .then(({ data }) => {
        set({ data: extractCollections(data) });
      })
      .catch(() => {
        toast.error("Ma'lumot yuklashda xatolik yuz berdi");
      })
      .finally(() => set({ loading: false }));
  },

  // Update data
  changeData(data) {
    set({ data });
  },
}));
