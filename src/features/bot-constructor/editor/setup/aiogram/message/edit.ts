import * as monaco from "monaco-editor";

export const messageEditMethods = (monacoInstance: typeof monaco) => [
  {
    label: "edit_message_text()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText:
      "edit_message_text(chat_id=${1:chat_id}, message_id=${2:message_id}, text=${3:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "✏️ Xabar matnini tahrirlash",
    documentation:
      "Yuborilgan xabarning matnini o'zgartirish. chat_id va message_id kerak.",
  },
  {
    label: "edit_message_caption()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText:
      "edit_message_caption(chat_id=${1:chat_id}, message_id=${2:message_id}, caption=${3:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "📝 Xabar caption'ini tahrirlash",
    documentation:
      "Media xabarning caption'ini o'zgartirish. chat_id va message_id kerak.",
  },
  {
    label: "edit_message_reply_markup()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText:
      "edit_message_reply_markup(chat_id=${1:chat_id}, message_id=${2:message_id}, reply_markup=${3:None})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "⌨️ Xabar tugmalarini tahrirlash",
    documentation:
      "Xabarning inline yoki reply keyboard'ini o'zgartirish. reply_markup=None bo'lsa, tugmalar olib tashlanadi.",
  },
  {
    label: "edit_message_media()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText:
      "edit_message_media(chat_id=${1:chat_id}, message_id=${2:message_id}, media=${3:InputMediaPhoto(media='')})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🖼️ Xabar media'sini tahrirlash",
    documentation:
      "Xabarning media'sini (rasm, video, audio, fayl) o'zgartirish. InputMediaPhoto, InputMediaVideo, InputMediaAudio, InputMediaDocument ishlatiladi.",
  },
  {
    label: "edit_text()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText:
      "edit_text(text=${1:''}, message_id=${2:context.get('last_message_id')})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "✏️ Qisqa yo'l: Matnni tahrirlash",
    documentation:
      "Context'dan message_id ni olib, joriy chat'da xabarni tahrirlash. message_id ixtiyoriy.",
  },
  {
    label: "edit_caption()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText:
      "edit_caption(caption=${1:''}, message_id=${2:context.get('last_message_id')})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "📝 Qisqa yo'l: Caption'ni tahrirlash",
    documentation:
      "Context'dan message_id ni olib, joriy chat'da media xabarning caption'ini tahrirlash.",
  },
  {
    label: "edit_keyboard()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText:
      "edit_keyboard(reply_markup=${1:None}, message_id=${2:context.get('last_message_id')})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "⌨️ Qisqa yo'l: Tugmalarni tahrirlash",
    documentation:
      "Context'dan message_id ni olib, joriy chat'da xabarning keyboard'ini tahrirlash. reply_markup=None bo'lsa, tugmalar olib tashlanadi.",
  },
];
