// FAYL: constructor/nodes/custom/CustomCodeNode/types.ts (YANGILANGAN)

export type CodeExecutionContext = "message" | "callback";

export interface CustomCodeNodeData {
  // --- YANGI MAYDONLAR ---
  /** Foydalanuvchi tomonidan berilgan maxsus nom */
  nodeTitle?: string;

  jsCode?: string;
  // Yangi maydon: foydalanuvchi tanlagan kontekst
  contextType?: CodeExecutionContext;
}
