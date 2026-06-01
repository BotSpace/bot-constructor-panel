import { CollectionListItem } from "@/types/http/collection";
import { create } from "zustand";
import { instanceAuth } from "@/services/instance";
import toast from "react-hot-toast";

// cms app returns {status: bool, data: [...]} or {status: bool, data: {results: [...]}}
type CmsCollectionRaw = {
  _id?: string;
  id?: string | number;
  name: string;
  [key: string]: unknown;
};

type CmsCollectionsResponse = {
  status: boolean;
  data: CmsCollectionRaw[] | { results: CmsCollectionRaw[] };
};

function extractCollections(raw: CmsCollectionsResponse): CollectionListItem[] {
  const payload = raw.data;
  const items: CmsCollectionRaw[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { results: CmsCollectionRaw[] }).results)
    ? (payload as { results: CmsCollectionRaw[] }).results
    : [];

  return items.map((item) => ({
    id: item._id ?? item.id ?? item.name,
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
      .get<CmsCollectionsResponse>(`/cms/projects/${project_id}/collections/`)
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
