"use client";

import React, { useRef } from "react";
import { Editor } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface MonoPythonEditorProps {
  initialCode: string;
  onCodeChange: (code: string) => void;
}

const MonoPythonEditor: React.FC<MonoPythonEditorProps> = ({
  initialCode,
  onCodeChange,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<any>(null);

  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: any
  ) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.languages.registerCompletionItemProvider("python", {
      provideCompletionItems: (model: any, position: any) => {
        // Avvalgi takliflar
        const baseSuggestions = [
          {
            label: 'if __name__ == "__main__"',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'if __name__ == "__main__":\n    asyncio.run(main())',
            documentation: "Standard Python async entry point.",
          },
          // ... boshqa umumiy takliflar
        ];

        // --- AIOGRAM UCHUN MAXSUS TAKLIFLAR ---
        const aiogramSuggestions = [
          // Imports
          {
            label: "aiogram_imports",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "import asyncio",
              "import logging",
              "from aiogram import Bot, Dispatcher, Router, F",
              "from aiogram.types import Message",
              "from aiogram.filters import CommandStart",
            ].join("\n"),
            documentation: "Aiogram 3.x uchun asosiy importlar",
          },
          // Bot va Dispatcher yaratish
          {
            label: "bot_setup",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              'bot = Bot(token="${1:YOUR_BOT_TOKEN}")\ndp = Dispatcher()',
            documentation: "Bot va Dispatcher obyektlarini yaratish",
          },
          // To'liq bot shabloni
          {
            label: "aiogram_boilerplate",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "import asyncio",
              "import logging",
              "from aiogram import Bot, Dispatcher, Router, F",
              "from aiogram.types import Message",
              "from aiogram.filters import CommandStart",
              "",
              "# Bot tokenini bu yerga yozing",
              'API_TOKEN = "${1:YOUR_BOT_TOKEN}"',
              "",
              "# Router yaratamiz",
              "router = Router()",
              "",
              "@router.message(CommandStart())",
              "async def cmd_start(message: Message):",
              '    await message.answer("Salom!")',
              "",
              "async def main():",
              "    bot = Bot(token=API_TOKEN)",
              "    dp = Dispatcher()",
              "    dp.include_router(router)",
              "",
              "    # Eski webhookni o'chirish (ixtiyoriy)",
              "    await bot.delete_webhook(drop_pending_updates=True)",
              "    await dp.start_polling(bot)",
              "",
              'if __name__ == "__main__":',
              "    logging.basicConfig(level=logging.INFO)",
              "    asyncio.run(main())",
            ].join("\n"),
            documentation: "Aiogram 3.x uchun to'liq ishchi shablon",
          },
          // Handlerlar
          {
            label: "@router.message",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              "@router.message(${1:F.text})",
              "async def message_handler(message: Message):",
              '    await message.answer("${2:Javob matni}")',
            ].join("\n"),
            documentation: "Yangi xabarlar uchun handler (message handler)",
          },
          {
            label: "@router.callback_query",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              '@router.callback_query(${1:F.data == "my_callback"})',
              "async def callback_handler(callback_query: CallbackQuery):",
              "    await callback_query.answer()",
              '    await callback_query.message.edit_text("${2:Yangi matn}")',
            ].join("\n"),
            documentation: "Callback query uchun handler (inline tugmalar)",
          },
          // Magic Filter
          {
            label: "F.text",
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: "F.text",
            documentation: "Xabar matnini filterlash (Magic Filter)",
          },
          {
            label: "F.data",
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: "F.data",
            documentation: "Callback ma'lumotini filterlash (Magic Filter)",
          },
          // Boshqa foydali narsalar
          {
            label: "message.answer",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'await message.answer("${1:Text}")',
            documentation: "Xabarga javob yuborish",
          },
        ];

        return { suggestions: [...baseSuggestions, ...aiogramSuggestions] };
      },
    });
  }

  function handleEditorChange(value: string | undefined) {
    if (value !== undefined) {
      onCodeChange(value);
    }
  }

  return (
    <Editor
      height="80vh"
      language="python"
      theme="vs-dark"
      defaultValue={initialCode}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        fontFamily: "'Fira Code', monospace", // Fira Code shriftini belgilaymiz
        fontLigatures: true, // Ligaturalarni yoqamiz
        fontSize: 16,
        minimap: { enabled: true },
        contextmenu: true,
        wordWrap: "on",
        tabSize: 4,
      }}
    />
  );
};

export default MonoPythonEditor;
