import * as monaco from "monaco-editor";

export const aiogramGlobals = (monacoInstance: typeof monaco) => [
  // Asosiy obyektlar (handlerlarda ishlatiladi)
  {
    label: "message",
    kind: monacoInstance.languages.CompletionItemKind.Variable, // Bu o'zgaruvchi
    insertText: "message",
    detail: "Message: Kiruvchi xabar obyekti",
  },
  {
    label: "callback",
    kind: monacoInstance.languages.CompletionItemKind.Variable, // Bu ham o'zgaruvchi
    insertText: "callback",
    detail: "CallbackQuery: Kiruvchi inline tugma so'rovi",
  },
  {
    label: "bot",
    kind: monacoInstance.languages.CompletionItemKind.Variable, // Bot instansi
    insertText: "bot",
    detail: "Bot: Bot instansi",
  },

  // Aiogram'dan import qilinadigan classlar
  {
    label: "Bot",
    kind: monacoInstance.languages.CompletionItemKind.Class, // Bu klass
    insertText: "Bot",
    detail: "from aiogram import Bot",
  },
  {
    label: "Dispatcher",
    kind: monacoInstance.languages.CompletionItemKind.Class, // Bu klass
    insertText: "Dispatcher",
    detail: "from aiogram import Dispatcher",
  },
  {
    label: "F",
    kind: monacoInstance.languages.CompletionItemKind.Class, // "F" ham klass kabi ishlatiladi
    insertText: "F",
    detail: "from aiogram import F (Magic Filters)",
  },

  // Tiplar
  {
    label: "Message",
    kind: monacoInstance.languages.CompletionItemKind.Class,
    insertText: "Message",
    detail: "from aiogram.types import Message",
  },
  {
    label: "CallbackQuery",
    kind: monacoInstance.languages.CompletionItemKind.Class,
    insertText: "CallbackQuery",
    detail: "from aiogram.types import CallbackQuery",
  },

  // Keyboard'lar
  {
    label: "InlineKeyboardMarkup",
    kind: monacoInstance.languages.CompletionItemKind.Class,
    insertText: "InlineKeyboardMarkup",
    detail: "from aiogram.types import InlineKeyboardMarkup",
  },
  {
    label: "InlineKeyboardButton",
    kind: monacoInstance.languages.CompletionItemKind.Class,
    insertText: "InlineKeyboardButton",
    detail: "from aiogram.types import InlineKeyboardButton",
  },
  {
    label: "ReplyKeyboardMarkup",
    kind: monacoInstance.languages.CompletionItemKind.Class,
    insertText: "ReplyKeyboardMarkup",
    detail: "from aiogram.types import ReplyKeyboardMarkup",
  },
  {
    label: "KeyboardButton",
    kind: monacoInstance.languages.CompletionItemKind.Class,
    insertText: "KeyboardButton",
    detail: "from aiogram.types import KeyboardButton",
  },
];
