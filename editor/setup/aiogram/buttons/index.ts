// editor/setup/aiogram/buttons/index.ts

import * as monaco from "monaco-editor";
import { inlineButtonSnippets } from "./inline";
import { replyButtonSnippets } from "./reply";

export const buttonSnippets = (monacoInstance: typeof monaco) => [
  ...inlineButtonSnippets(monacoInstance),
  ...replyButtonSnippets(monacoInstance),
];
