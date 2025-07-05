export type CodeExecutionContext = "message" | "callback";

export interface CustomCodeNodeData {
  pythonCode?: string;
  // Yangi maydon: foydalanuvchi tanlagan kontekst
  contextType?: CodeExecutionContext;
}
