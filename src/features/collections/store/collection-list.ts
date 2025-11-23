import { CollectionListItem } from "@/types/http/collection";
import create from "zustand";
import { instanceAuth } from "@/services/instance";
import {
  APIDetailCreateResponse,
  APIListResponse,
} from "@/types/http/response";
import toast from "react-hot-toast";

type CollectionStore = {
  data: CollectionListItem[] | null;
  loading: boolean;
  loadCollections: (project_id: string) => void;
  changeData: (data: CollectionListItem[]) => void;
};

export const useCollectionStore = create<CollectionStore>((set, get) => ({
  data: null,
  loading: true,

  // Load collection data
  loadCollections(collection_id) {
    set({ loading: true });

    instanceAuth
      .get<APIListResponse<CollectionListItem[]>>(
        `/collection/?project=${collection_id}`
      )
      .then(({ data }) => {
        set({ data: data.data.results });
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
