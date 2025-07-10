import * as monaco from "monaco-editor";

export const messageSendMethods = (monacoInstance: typeof monaco) => [
  {
    label: "answer()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "answer(text=${1:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "✍️ Joriy chatga javob yuborish",
    documentation: "message.chat.id ga xabar yuborish uchun qisqa yo'l.",
  },
  {
    label: "reply()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "reply(text=${1:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "↩️ Xabarga javob qaytarish (Reply)",
    documentation: "Asl xabarga reply qilib javob yuboradi.",
  },
  {
    label: "answer_photo()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "answer_photo(photo=${1:''}, caption=${2:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🖼 Joriy chatga rasm yuborish",
    documentation: "Joriy chatga photo va caption bilan rasm yuborish.",
  },
  {
    label: "answer_video()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "answer_video(video=${1:''}, caption=${2:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🎬 Joriy chatga video yuborish",
    documentation: "Joriy chatga video yuboradi. caption majburiy emas.",
  },
  {
    label: "answer_document()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "answer_document(document=${1:''}, caption=${2:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "📄 Joriy chatga hujjat yuborish",
    documentation: "PDF, DOC yoki boshqa hujjatni yuborish.",
  },
  {
    label: "answer_audio()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "answer_audio(audio=${1:''}, caption=${2:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🎵 Joriy chatga audio yuborish",
    documentation: "Audio (MP3 yoki OGG) yuborish.",
  },
  {
    label: "answer_voice()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "answer_voice(voice=${1:''}, caption=${2:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🎤 Joriy chatga ovozli xabar yuborish",
    documentation: "Ovozli xabar (voice) yuborish uchun.",
  },
  {
    label: "answer_animation()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "answer_animation(animation=${1:''}, caption=${2:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🧸 Joriy chatga GIF yuborish",
    documentation: "GIF animatsiya yuborish uchun ishlatiladi.",
  },
  {
    label: "answer_sticker()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "answer_sticker(sticker=${1:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "💠 Sticker yuborish",
    documentation: "Joriy suhbatga sticker yuborish.",
  },
  {
    label: "answer_location()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "answer_location(latitude=${1:''}, longitude=${2:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "📍 Lokatsiya yuborish",
    documentation: "Koordinatalar orqali joylashuv yuboradi.",
  },
  {
    label: "answer_venue()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText:
      "answer_venue(latitude=${1:''}, longitude=${2:''}, title=${3:''}, address=${4:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🏢 Manzil bilan lokatsiya yuborish",
    documentation: "Nom va manzil bilan joy yuboriladi.",
  },
  {
    label: "answer_contact()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "answer_contact(phone_number=${1:''}, first_name=${2:''})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "👤 Kontakt yuborish",
    documentation: "Ism va telefon raqamli kontakt yuboriladi.",
  },
  {
    label: "answer_poll()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "answer_poll(question=${1:''}, options=${2:[]})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "📊 So‘rovnoma yuborish",
    documentation: "Savol va variantlar bilan poll yuboriladi.",
  },
  {
    label: "answer_dice()",
    kind: monacoInstance.languages.CompletionItemKind.Function,
    insertText: "answer_dice(emoji=${1:'🎲'})",
    insertTextRules:
      monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    detail: "🎲 Random emoji yuborish",
    documentation: "Dice yoki boshqa emoji o‘yin yuboriladi.",
  },
];
