import { create } from "zustand";

export type EditorTheme = "vs-dark" | "vs-light" | "hc-black";

export interface EditorSettingsState {
  fontSize: number;
  fontFamily: string;
  theme: EditorTheme;
  minimap: boolean;
  wordWrap: boolean;
  lineNumbers: boolean;
  folding: boolean;
  renderWhitespace: boolean;
  setFontSize: (size: number) => void;
  setFontFamily: (family: string) => void;
  setTheme: (theme: EditorTheme) => void;
  setMinimap: (enabled: boolean) => void;
  setWordWrap: (enabled: boolean) => void;
  setLineNumbers: (enabled: boolean) => void;
  setFolding: (enabled: boolean) => void;
  setRenderWhitespace: (enabled: boolean) => void;
  reset: () => void;
}

const defaultFontFamily =
  "'JetBrains Mono', 'Fira Code', 'Consolas', monospace";

export const useEditorSettings = create<EditorSettingsState>((set) => ({
  fontSize: 14,
  fontFamily: defaultFontFamily,
  theme: "vs-dark",
  minimap: false,
  wordWrap: true,
  lineNumbers: true,
  folding: true,
  renderWhitespace: false,
  setFontSize: (fontSize) => set({ fontSize }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setTheme: (theme) => set({ theme }),
  setMinimap: (minimap) => set({ minimap }),
  setWordWrap: (wordWrap) => set({ wordWrap }),
  setLineNumbers: (lineNumbers) => set({ lineNumbers }),
  setFolding: (folding) => set({ folding }),
  setRenderWhitespace: (renderWhitespace) => set({ renderWhitespace }),
  reset: () =>
    set({
      fontSize: 14,
      fontFamily: defaultFontFamily,
      theme: "vs-dark",
      minimap: false,
      wordWrap: true,
      lineNumbers: true,
      folding: true,
      renderWhitespace: false,
    }),
}));
