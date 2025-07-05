import type { IRange, IDisposable } from "monaco-editor";
import type * as monacoEditor from "monaco-editor";
import { CodeExecutionContext } from "./types";

// =========================================================================
// YORDAMCHI FUNKSIYALAR: Podskazkalar ro'yxatini yaratish uchun
// Har bir funksiya 'monaco' obyektini parametr sifatida qabul qiladi
// =========================================================================

/** Tayyor shablonlar (Snippets) ro'yxatini qaytaradi */
const getSnippets = (range: IRange, monaco: typeof monacoEditor) => [
  {
    label: "print",
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: ["print(${1:'Hello world'})"].join("\n"),
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "if/else bloki uchun shablon",
    range: range,
  },
  {
    label: "if/else",
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: [
      "if ${1:condition}:",
      "\t${2:pass}",
      "else:",
      "\t${3:pass}",
    ].join("\n"),
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "if/else bloki uchun shablon",
    range: range,
  },
  {
    label: "try/except",
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: [
      "try:",
      "\t${1:pass}",
      "except Exception as e:",
      '\tprint(f"Xatolik: {e}")',
    ].join("\n"),
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "try/except bloki uchun shablon",
    range: range,
  },
  {
    label: "for loop",
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: "for ${1:item} in ${2:iterable}:\n\t${3:pass}",
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "For tsikli uchun shablon",
    range: range,
  },
];

/** 'bot' obyekti uchun metodlar ro'yxatini qaytaradi */
const getBotCompletions = (range: IRange, monaco: typeof monacoEditor) => [
  {
    label: "send_message",
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: 'send_message(chat_id=${1:chat_id}, text="${2:Salom}")',
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "Matnli xabar yuborish",
    range: range,
  },
  {
    label: "send_photo",
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: 'send_photo(chat_id=${1:chat_id}, photo="${2:file_id_or_url}")',
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "Rasm yuborish",
    range: range,
  },
  {
    label: "answer_callback_query",
    kind: monaco.languages.CompletionItemKind.Method,
    insertText:
      'answer_callback_query(callback_query_id=${1:callback.id}, text="${2:Bajarildi}")',
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "Callback so`roviga javob berish",
    range: range,
  },
];

/** 'message' obyekti uchun maydonlar ro'yxatini qaytaradi */
const getMessageCompletions = (range: IRange, monaco: typeof monacoEditor) => [
  {
    label: "text",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "text",
    documentation: "Xabar matni",
    range,
  },
  {
    label: "from_user",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "from_user",
    documentation: "Yuboruvchi haqida ma`lumot",
    range,
  },
  {
    label: "chat",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "chat",
    documentation: "Chat haqida ma`lumot",
    range,
  },
  {
    label: "message_id",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "message_id",
    documentation: "Xabar IDsi",
    range,
  },
  {
    label: "caption",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "caption",
    documentation: "Rasm/video ostidagi matn",
    range,
  },
];

/** 'callback' obyekti uchun maydonlar ro'yxatini qaytaradi */
const getCallbackCompletions = (range: IRange, monaco: typeof monacoEditor) => [
  {
    label: "data",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "data",
    documentation: "Callback ma`lumoti",
    range,
  },
  {
    label: "message",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "message",
    documentation: "Callback kelgan xabar",
    range,
  },
  {
    label: "from_user",
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: "from_user",
    documentation: "Yuboruvchi haqida ma`lumot",
    range,
  },
];

/** Global o'zgaruvchilar ro'yxatini kontekstga qarab qaytaradi */
const getGlobalVariables = (
  range: IRange,
  monaco: typeof monacoEditor,
  contextType: CodeExecutionContext
) => {
  const variables = [
    {
      label: "bot",
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: "bot",
      range,
    },
    {
      label: "context",
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: "context",
      range,
    },
    {
      label: "chat_id",
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: "chat_id",
      range,
    },
  ];

  if (contextType === "message") {
    variables.push({
      label: "message",
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: "message",
      range,
    });
  } else {
    // 'callback'
    variables.push({
      label: "callback",
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: "callback",
      range,
    });
  }
  return variables;
};

// =========================================================================
// ASOSIY FUNKSIYA: Monaco Editor'ni sozlaydi
// =========================================================================

/**
 * Monaco Editor'ni Python va Aiogram podskazkalari bilan sozlaydi.
 * @param monaco Monaco obyektining instansi
 * @param contextType Qaysi kontekstda ishlash kerakligi ('message' yoki 'callback')
 * @returns Tozalash uchun `disposable` obyektlar massivi
 */
export const setupPythonEditor = (
  monaco: typeof monacoEditor,
  contextType: CodeExecutionContext
): IDisposable[] => {
  const disposables: IDisposable[] = [];

  // Provider 1: Umumiy snippetlar va global o'zgaruvchilar uchun
  // Bu provider 'Ctrl+Space' bosilganda yoki harf yozishni boshlaganda ishlaydi.
  disposables.push(
    monaco.languages.registerCompletionItemProvider("python", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const snippets = getSnippets(range, monaco);
        const globalVars = getGlobalVariables(range, monaco, contextType);

        return { suggestions: [...snippets, ...globalVars] };
      },
    })
  );

  // Provider 2: Nuqtadan keyingi (obyekt metodlari va maydonlari) podskazkalar uchun
  // Bu provider faqat '.' belgisi yozilganda ishga tushadi.
  disposables.push(
    monaco.languages.registerCompletionItemProvider("python", {
      triggerCharacters: ["."],
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model
          .getLineContent(position.lineNumber)
          .substring(0, position.column - 1)
          .trim();
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        if (textUntilPosition.endsWith("bot")) {
          return { suggestions: getBotCompletions(range, monaco) };
        }
        if (textUntilPosition.endsWith("message")) {
          return { suggestions: getMessageCompletions(range, monaco) };
        }
        if (
          contextType === "callback" &&
          textUntilPosition.endsWith("callback")
        ) {
          return { suggestions: getCallbackCompletions(range, monaco) };
        }
        if (textUntilPosition.endsWith("from_user")) {
          // Masalan: message.from_user. dan keyin
          // Bu qismni yanada boyitish mumkin
        }

        // Agar mos kelmasa, hech narsa qaytarmaymiz, shunda Monaco o'zining standart podskazkalarini berishi mumkin.
        return undefined;
      },
    })
  );

  return disposables;
};
