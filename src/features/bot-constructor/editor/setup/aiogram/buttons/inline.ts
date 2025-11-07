// editor/setup/aiogram/buttons/inline.ts

import * as monaco from "monaco-editor";

export const inlineButtonSnippets = (monacoInstance: typeof monaco) => [
  {
    label: "InlineKeyboardButton (callback_data)",
    kind: monacoInstance.languages.CompletionItemKind.Snippet,
    insertText:
      'InlineKeyboardButton(text="${1:Matn}", callback_data="${2:data}")',
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "📲 Callback ma'lumotli tugma",
    documentation:
      "Ushbu tugma bosilganda botga 'callback_data'dagi ma'lumotni yuboradi.",
  },
  {
    label: "InlineKeyboardButton (url)",
    kind: monacoInstance.languages.CompletionItemKind.Snippet,
    insertText:
      'InlineKeyboardButton(text="${1:Matn}", url="${2:https://...}")',
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🔗 Havola (URL) ochuvchi tugma",
    documentation:
      "Ushbu tugma bosilganda brauzerda ko'rsatilgan havolani ochadi.",
  },
  {
    label: "InlineKeyboardButton (web_app)",
    kind: monacoInstance.languages.CompletionItemKind.Snippet,
    insertText:
      'InlineKeyboardButton(text="${1:Matn}", web_app={"url": "${2:https://...}"})',
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🌐 WebApp ochuvchi tugma",
    documentation: "Ushbu tugma bosilganda Telegram WebApp'ni ochadi.",
  },
  {
    label: "InlineKeyboardButton (switch_inline_query)",
    kind: monacoInstance.languages.CompletionItemKind.Snippet,
    insertText:
      'InlineKeyboardButton(text="${1:Matn}", switch_inline_query="${2:so\'rov}")',
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🔄 Global inline qidiruvga o'tish",
    documentation:
      "Tugma bosilganda, chat tanlash oynasi ochiladi va tanlangan chatda inline qidiruvni ishga tushiradi.",
  },
  {
    label: "InlineKeyboardButton (switch_inline_query_current_chat)",
    kind: monacoInstance.languages.CompletionItemKind.Snippet,
    insertText:
      'InlineKeyboardButton(text="${1:Matn}", switch_inline_query_current_chat="${2:so\'rov}")',
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "💬 Joriy chatda inline qidiruv",
    documentation:
      "Tugma bosilganda, hozirgi chatning o'zida inline qidiruvni ishga tushiradi.",
  },
  {
    label: "InlineKeyboardButton (login_url)",
    kind: monacoInstance.languages.CompletionItemKind.Snippet,
    insertText:
      'InlineKeyboardButton(text="${1:Kirish}", login_url={"url": "${2:https://...}"})',
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🔑 Login URL orqali avtorizatsiya",
    documentation:
      "Telegram orqali veb-saytga xavfsiz kirish uchun ishlatiladi.",
  },
];
