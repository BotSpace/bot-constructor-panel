import * as monaco from "monaco-editor";

export const messageProperties = (monacoInstance: typeof monaco) => [
  {
    label: "from_user",
    kind: monacoInstance.languages.CompletionItemKind.Class,
    insertText: "from_user.",
    detail: "👤 Foydalanuvchi obyekti",
    documentation: "Xabarni yuborgan foydalanuvchi haqida ma'lumot.",
  },
  {
    label: "chat",
    kind: monacoInstance.languages.CompletionItemKind.Class,
    insertText: "chat.",
    detail: "💬 Chat obyekti",
    documentation: "Xabar yuborilgan chat haqida ma'lumot.",
  },
  {
    label: "message_id",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "message_id",
    detail: "Integer: Xabarning unikal identifikatori",
  },
  {
    label: "text",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "text",
    detail: "String: Matnli xabar mazmuni (ixtiyoriy)",
  },
  {
    label: "date",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "date",
    detail: "Integer: Xabar yuborilgan sana (Unix time)",
  },
  // Boshqa turdagi kontentlar uchun maydonlar
  {
    label: "photo",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "photo",
    detail: "Rasm obyekti",
  },
  {
    label: "audio",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "audio",
    detail: "Audio obyekti",
  },
  {
    label: "document",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "document",
    detail: "Hujjat obyekti",
  },
  {
    label: "video",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "video",
    detail: "Video obyekti",
  },
  {
    label: "caption",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "caption",
    detail: "String: Media uchun izoh",
  },
];
