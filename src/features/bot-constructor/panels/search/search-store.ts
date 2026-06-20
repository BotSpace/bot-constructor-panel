import { create } from "zustand";

interface SearchState {
  searchPanelIsOpen: boolean;
  setSearchPanel: (value: boolean) => void;
  toggleSearchPanel: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchPanelIsOpen: false,
  setSearchPanel: (value) => set({ searchPanelIsOpen: value }),
  toggleSearchPanel: () => set({ searchPanelIsOpen: !get().searchPanelIsOpen }),
}));
