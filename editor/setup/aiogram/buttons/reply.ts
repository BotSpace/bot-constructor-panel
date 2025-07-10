// editor/setup/aiogram/buttons/reply.ts

import * as monaco from "monaco-editor";

export const replyButtonSnippets = (monacoInstance: typeof monaco) => [
  {
    label: "KeyboardButton (matn)",
    kind: monacoInstance.languages.CompletionItemKind.Snippet,
    insertText: 'KeyboardButton(text="${1:Tugma matni}")',
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "✍️ Oddiy matn yuboruvchi tugma",
    documentation:
      "Ushbu tugma bosilganda botga oddiy matnli xabar yuboriladi.",
  },
  {
    label: "KeyboardButton (request_contact)",
    kind: monacoInstance.languages.CompletionItemKind.Snippet,
    insertText:
      'KeyboardButton(text="${1:Kontakt yuborish}", request_contact=True)',
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "👤 Kontakt so'rovchi tugma",
    documentation: "Foydalanuvchidan o'z telefon raqamini yuborishni so'raydi.",
  },
  {
    label: "KeyboardButton (request_location)",
    kind: monacoInstance.languages.CompletionItemKind.Snippet,
    insertText:
      'KeyboardButton(text="${1:Lokatsiya yuborish}", request_location=True)',
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "📍 Joylashuv so'rovchi tugma",
    documentation: "Foydalanuvchidan o'z joylashuvini yuborishni so'raydi.",
  },
  {
    label: "KeyboardButton (request_poll)",
    kind: monacoInstance.languages.CompletionItemKind.Snippet,
    insertText:
      'KeyboardButton(text="${1:So\'rovnoma yaratish}", request_poll={"type": "${2:quiz/regular}"})',
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "📊 So'rovnoma (poll/quiz) so'rovchi tugma",
    documentation:
      "Foydalanuvchidan poll yoki quiz yaratishni so'raydi. 'type' quiz yoki regular bo'lishi mumkin.",
  },
  {
    label: "KeyboardButton (web_app)",
    kind: monacoInstance.languages.CompletionItemKind.Snippet,
    insertText:
      'KeyboardButton(text="${1:WebApp ochish}", web_app={"url": "${2:https://...}"})',
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🌐 WebApp ochuvchi tugma (Reply)",
    documentation: "Ushbu tugma bosilganda Telegram WebApp'ni ochadi.",
  },
];
