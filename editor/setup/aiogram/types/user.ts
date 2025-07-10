import * as monaco from "monaco-editor";

export const userProperties = (monacoInstance: typeof monaco) => [
  {
    label: "id",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "id",
    detail: "Integer: Foydalanuvchining unikal identifikatori",
  },
  {
    label: "is_bot",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "is_bot",
    detail: "Boolean: Ushbu foydalanuvchi bot bo'lsa, true",
  },
  {
    label: "first_name",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "first_name",
    detail: "String: Foydalanuvchining ismi",
  },
  {
    label: "last_name",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "last_name",
    detail: "String: Foydalanuvchining familiyasi (ixtiyoriy)",
  },
  {
    label: "username",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "username",
    detail: "String: Foydalanuvchining @username'i (ixtiyoriy)",
  },
  {
    label: "language_code",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "language_code",
    detail: "String: Foydalanuvchi tilining kodi (ixtiyoriy)",
  },
  {
    label: "is_premium",
    kind: monacoInstance.languages.CompletionItemKind.Property,
    insertText: "is_premium",
    detail: "Boolean: Foydalanuvchi Telegram Premium a'zosi bo'lsa, true",
  },
  {
    label: "get_profile_photos()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    // O'ZGARISH: Snippet sintaksisi qo'shildi.
    // $0 - bu snippet tugagandan so'ng kursor turadigan yakuniy joy.
    insertText: "get_profile_photos()$0",
    // O'ZGARISH: Bu snippet ekanligini ko'rsatamiz.
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🖼 Foydalanuvchi profil rasmlarini olish",
  },
];

export const userMethods = (monaco: any) => ({
  suggestions: userProperties(monaco),
});
