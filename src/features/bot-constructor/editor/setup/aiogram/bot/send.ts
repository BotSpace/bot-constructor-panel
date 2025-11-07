import * as monaco from "monaco-editor";

export const sendMethods = (monacoInstance: typeof monaco) => [
  {
    label: "send_message()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "send_message(chat_id=${1:''}, text=${2:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "📩 Matnli xabar yuborish",
    documentation: "Bot orqali foydalanuvchiga oddiy matnli xabar yuboradi.",
  },
  {
    label: "send_photo()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "send_photo(chat_id=${1:''}, photo=${2:''}, caption=${3:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🖼 Rasm yuborish",
    documentation: "Bot orqali rasm yuborish. photo: file_id yoki URL.",
  },
  {
    label: "send_audio()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "send_audio(chat_id=${1:''}, audio=${2:''}, caption=${3:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🎵 Audio yuborish",
    documentation: "Audio fayl yuborish. audio: file_id yoki InputFile.",
  },
  {
    label: "send_document()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText:
      "send_document(chat_id=${1:''}, document=${2:''}, caption=${3:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "📄 Hujjat yuborish",
    documentation: "PDF, Word va boshqa hujjatlarni yuborish.",
  },
  {
    label: "send_video()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "send_video(chat_id=${1:''}, video=${2:''}, caption=${3:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🎬 Video yuborish",
    documentation: "MP4 va boshqa video fayllarni yuborish.",
  },
  {
    label: "send_animation()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText:
      "send_animation(chat_id=${1:''}, animation=${2:''}, caption=${3:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🧸 GIF yuborish",
    documentation: "GIF animatsiya yuborish uchun ishlatiladi.",
  },
  {
    label: "send_voice()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "send_voice(chat_id=${1:''}, voice=${2:''}, caption=${3:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🎤 Voice xabar yuborish",
    documentation: "Ovozli xabar yuborish uchun ishlatiladi. Format: .ogg",
  },
  {
    label: "send_video_note()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "send_video_note(chat_id=${1:''}, video_note=${2:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "📹 Video-note yuborish",
    documentation: "Dumaloq shakldagi video xabar yuboradi.",
  },
  {
    label: "send_sticker()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "send_sticker(chat_id=${1:''}, sticker=${2:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "💠 Sticker yuborish",
    documentation: "Sticker yuborish uchun ishlatiladi.",
  },
  {
    label: "send_location()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText:
      "send_location(chat_id=${1:''}, latitude=${2:''}, longitude=${3:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "📍 Lokatsiya yuborish",
    documentation: "Xaritada joylashuv yuborish uchun ishlatiladi.",
  },
  {
    label: "send_venue()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText:
      "send_venue(chat_id=${1:''}, latitude=${2:''}, longitude=${3:''}, title=${4:''}, address=${5:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🏢 Joylashuv manzili bilan yuborish",
    documentation: "Manzil va joy nomini ko‘rsatib lokatsiya yuborish.",
  },
  {
    label: "send_contact()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText:
      "send_contact(chat_id=${1:''}, phone_number=${2:''}, first_name=${3:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "👤 Kontakt yuborish",
    documentation: "Ism va telefon raqamli kontakt yuborish.",
  },
  {
    label: "send_poll()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "send_poll(chat_id=${1:''}, question=${2:''}, options=${3:[]})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "📊 So‘rovnoma yuborish",
    documentation: "Savol va variantlar bilan poll yuborish.",
  },
  {
    label: "send_dice()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "send_dice(chat_id=${1:''}, emoji=${2:'🎲'})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🎲 Random emoji o‘yini yuborish",
    documentation:
      "Dice, dart, basketball va boshqa emoji o‘yinlar yuboriladi.",
  },
  {
    label: "send_chat_action()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "send_chat_action(chat_id=${1:''}, action=${2:'typing'})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "💬 Typing yoki boshqa holatni ko‘rsatish",
    documentation:
      "Foydalanuvchiga 'Bot yozmoqda' yoki fayl yuklamoqda holatini ko‘rsatish uchun ishlatiladi.",
  },
];
