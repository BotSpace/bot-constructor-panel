import * as monaco from "monaco-editor";

export const callbackProperties = (monacoInstance: typeof monaco) => [
  {
    label: "id",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "id",
    detail: "String: Callback'ning unikal identifikatori",
  },
  {
    label: "from_user",
    kind: monacoInstance.languages.CompletionItemKind.Class,
    insertText: "from_user.",
    detail: "👤 Foydalanuvchi obyekti",
    documentation: "So'rovni yuborgan foydalanuvchi.",
  },
  {
    label: "message",
    kind: monacoInstance.languages.CompletionItemKind.Class,
    insertText: "message.",
    detail: "✉️ Xabar obyekti",
    documentation: "Inline tugma biriktirilgan asl xabar.",
  },
  {
    label: "data",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "data",
    detail: "String: Tugma bilan yuborilgan ma'lumot (callback_data)",
  },
  {
    label: "game_short_name",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "game_short_name",
    detail: "String: O'yin uchun qisqa nom (agar o'yin tugmasi bo'lsa)",
  },
];

export const callbackSendMethods = (monacoInstance: typeof monaco) => [
  {
    label: "answer()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "answer(text=${1:''}, show_alert=${2:False})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "💡 Callback so'roviga javob berish",
    documentation:
      "Foydalanuvchi ekranida bildirishnoma yoki alert ko'rsatadi.",
  },
];
