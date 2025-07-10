// FAYL: constructor/nodes/custom/CustomCodeNode/types.ts (YANGILANGAN)

import { EditorThemeName } from "@/constructor/data/editor-themes";

export type CodeExecutionContext = "message" | "callback";

export interface CustomCodeNodeData {
  // --- YANGI MAYDONLAR ---
  /** Foydalanuvchi tomonidan berilgan maxsus nom */
  nodeTitle?: string;
  /** Tanlangan kod muharriri temasi */
  editorTheme?: EditorThemeName;

  pythonCode?: string;
  // Yangi maydon: foydalanuvchi tanlagan kontekst
  contextType?: CodeExecutionContext;
}
