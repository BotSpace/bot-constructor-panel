import * as monaco from "monaco-editor";
import { botMethods } from "./bot";
import { messageMethods } from "./message";
import { callbackMethods } from "./callback";
import { userMethods } from "./types/user";
import { pythonKeywords } from "../python/keywords";
import { aiogramGlobals } from "./globals";
import { buttonSnippets } from "./buttons";

// Takliflarga `range` qo'shuvchi yordamchi funksiya
function createSuggestionsWithRange(suggestions: any[], range: monaco.IRange) {
  return suggestions.map((suggestion) => ({
    ...suggestion,
    range: range,
  }));
}

export function AiogramEditorSetup(monacoInstance: typeof monaco) {
  monacoInstance.languages.registerCompletionItemProvider("python", {
    // TRIGGER BELGISINI QAYTARAMIZ!
    triggerCharacters: ["."],

    provideCompletionItems: (model, position) => {
      // 1. Kursor oldidagi so'zni va uning o'rnini aniqlash
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      // 2. Obyekt zanjirlari uchun tekshiruv
      // Endi `provideCompletionItems` funksiyasi `.` bosilganda ham chaqiriladi.
      // `context.triggerCharacter` yordamida aynan nuqta bosilganini bilib olamiz.
      // (Garchi bizning mantiq `textUntilPosition`ga asoslangan bo'lsa-da, bu to'g'ri yondashuv)

      const lastChar = textUntilPosition.slice(-1);

      if (lastChar === ".") {
        const chainMatch = textUntilPosition.slice(0, -1).match(/[\w\._]+$/);
        if (chainMatch) {
          const chain = chainMatch[0];
          let suggestions: any[] = [];

          switch (chain) {
            case "bot":
              suggestions = botMethods(monacoInstance).suggestions;
              break;
            case "message":
              suggestions = messageMethods(monacoInstance).suggestions;
              break;
            // ... boshqa case'lar ...
            case "message.from_user":
              suggestions = userMethods(monacoInstance).suggestions;
              break;
            case "callback":
              suggestions = callbackMethods(monacoInstance).suggestions;
              break;
            case "callback.from_user":
              suggestions = userMethods(monacoInstance).suggestions;
              break;
            case "callback.message":
              suggestions = messageMethods(monacoInstance).suggestions;
              break;
            case "callback.message.from_user":
              suggestions = userMethods(monacoInstance).suggestions;
              break;
          }

          // Nuqtadan keyingi takliflar uchun range
          const dotRange = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column,
          };

          return {
            suggestions: createSuggestionsWithRange(suggestions, dotRange),
          };
        }
      }

      // 3. Global takliflar (agar nuqta bosilmagan bo'lsa)
      const allGlobalSuggestions = [
        ...pythonKeywords(monacoInstance),
        ...aiogramGlobals(monacoInstance),
        ...buttonSnippets(monacoInstance), // <-- QO'SHILGAN QATOR
      ];

      return {
        suggestions: createSuggestionsWithRange(allGlobalSuggestions, range),
      };
    },
  });
}
