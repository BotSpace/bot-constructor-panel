"use client";

import React, { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { linter } from "@codemirror/lint";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete"; // CompletionContext qo'shildi
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Code2, AlertCircle } from "lucide-react";

interface Props {
  code: string;
  onChange: (value: string) => void;
  globals: string[];
}

export const CodeEditorDialog = ({ code, onChange, globals }: Props) => {
  // 1. Maxsus Global o'zgaruvchilar uchun Autocomplete (Suggester)
  const globalCompletions = useMemo(() => {
    return javascriptLanguage.data.of({
      autocomplete: (context: any) => {
        const word = context.matchBefore(/\w*/);
        if (word.from === word.to && !context.explicit) return null;
        return {
          from: word.from,
          options: globals.map((g) => ({
            label: g,
            type: "variable",
            info: `Global bot ob'ekti: ${g}`,
          })),
        };
      },
    });
  }, [globals]);

  // 1. Maxsus va Standart completionlarni birlashtiramiz
  const customAutocomplete = useMemo(() => {
    return (context: CompletionContext) => {
      // Joriy so'zni aniqlaymiz
      const word = context.matchBefore(/\w*/);

      // Agar hech narsa yozilmagan bo'lsa va majburiy chaqirilmagan bo'lsa - qaytaramiz
      if (!word || (word.from === word.to && !context.explicit)) return null;

      return {
        from: word.from,
        options: [
          // Bizning maxsus ob'ektlarimiz
          ...globals.map((g) => ({
            label: g,
            type: "variable",
            boost: 99, // Bizning o'zgaruvchilarni ro'yxatda yuqoriroqqa chiqaradi
            info: `Bot global ob'ekti`,
          })),
          // Bu yerga yana qo'shimcha snippetlar qo'shish mumkin
          {
            label: "console.log",
            type: "function",
            apply: "console.log();",
            detail: "Log to console",
          },
        ],
      };
    };
  }, [globals]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Code2 className="w-4 h-4" />
          Kod tahrirlash
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[760px] h-[80vh] flex flex-col bg-slate-950 text-white border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-yellow-500">
              <Code2 className="w-5 h-5" /> JS Bot Engine
            </span>
          </DialogTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {globals.map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded text-[10px] border border-yellow-500/20 font-mono"
              >
                {g}
              </span>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 border border-slate-800 rounded-md overflow-hidden mt-4 bg-[#1e1e1e]">
          <CodeMirror
            value={code}
            height="100%"
            theme={vscodeDark}
            className="h-full text-sm"
            extensions={[
              javascript(), // 1. Standart JS (console, Math va h.k. shu ichida)
              autocompletion({
                override: [customAutocomplete], // 2. Bizning custom completionni standartga qo'shish
              }),
              linter((view) => {
                // Linter logikasi...
                return [];
              }),
            ]}
            onChange={onChange}
            basicSetup={{
              lineNumbers: true,
              autocompletion: true, // Bu true bo'lishi shart
              bracketMatching: true,
              closeBrackets: true,
            }}
          />

          {/* Scrollbar uchun custom CSS */}
          <style jsx global>{`
            .cm-editor {
              height: 100% !important;
            }
            .cm-scroller {
              overflow: auto !important;
              scrollbar-width: thin;
              scrollbar-color: #444 #1e1e1e;
            }
            .cm-scroller::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            .cm-scroller::-webkit-scrollbar-track {
              background: #1e1e1e;
            }
            .cm-scroller::-webkit-scrollbar-thumb {
              background-color: #333;
              border-radius: 10px;
              border: 2px solid #1e1e1e;
            }
            .cm-scroller::-webkit-scrollbar-thumb:hover {
              background-color: #444;
            }
          `}</style>
        </div>

        <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
          <p className="flex items-center gap-1 italic">
            <AlertCircle className="w-3 h-3" />
            Eslatma: Kod faqat serverda ishga tushadi.
          </p>
          <DialogTrigger asChild>
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-8">
              Saqlash
            </Button>
          </DialogTrigger>
        </div>
      </DialogContent>
    </Dialog>
  );
};
