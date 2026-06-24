"use client";

import React, { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { linter } from "@codemirror/lint";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Code2, AlertCircle } from "lucide-react";
import { useIsInNodePanel } from "@/features/bot-constructor/hooks/NodePanelContext";

// Custom code uchun o'zgaruvchilar modeli (autocomplete).
//
// PUBLIC o'zgaruvchilar (vars):
//   vars.name = value        — public o'zgaruvchi yozish → {{name}} bilan o'qiladi
//   vars.name                — public o'zgaruvchi o'qish
//
// PRIVATE o'zgaruvchilar (maxfiy):
//   private.token = value    — private o'zgaruvchi yozish → {{private.token}} bilan o'qiladi
//   private.token            — private o'zgaruvchi o'qish
//
// AUTO-CONTEXT (faqat o'qish):
//   vars.user.first_name     — foydalanuvchi ma'lumotlari ({{user.first_name}})
//   vars.webhook.body        — webhook ma'lumotlari ({{webhook.body}})
//   vars.message.text        — xabar ma'lumotlari ({{message.text}})

const HELPER_COMPLETIONS = [
  // --- vars — public o'zgaruvchilar (yangi model) ---
  {
    label: "vars",
    type: "variable",
    boost: 100,
    detail: "Public o'zgaruvchilar obyekti",
    info: "vars.name = value → {{name}} bilan o'qiladi.\nvars.user / vars.webhook / vars.message — auto-context (faqat o'qish).",
  },
  {
    label: "vars.",
    type: "variable",
    boost: 100,
    apply: "vars.",
    detail: "vars.name — public o'zgaruvchini o'qish/yozish",
    info: "Masalan: vars.phone = '998901234567' → {{phone}}",
  },
  // --- private — maxfiy o'zgaruvchilar ---
  {
    label: "private",
    type: "variable",
    boost: 99,
    detail: "Private (maxfiy) o'zgaruvchilar",
    info: "private.token = value → {{private.token}} bilan o'qiladi. Foydalanuvchiga ko'rsatilmaydi.",
  },
  {
    label: "private.",
    type: "variable",
    boost: 99,
    apply: "private.",
    detail: "private.key — maxfiy o'zgaruvchini o'qish/yozish",
    info: "Masalan: private.api_token = 'secret' → {{private.api_token}}",
  },
  // --- Eski funksiyalar (hali ham ishlaydi, lekin yangi model tavsiya etiladi) ---
  {
    label: "set_state",
    type: "function",
    apply: 'set_state("name", value)',
    detail: "(eski) State yozish — vars.name = value ishlatish tavsiya etiladi",
    info: 'vars.name = value → {{name}} | private.name = value → {{private.name}}',
  },
  {
    label: "get_state",
    type: "function",
    apply: 'get_state("name")',
    detail: "(eski) State o'qish — vars.name ishlatish tavsiya etiladi",
    info: 'get_state("name") → vars.name bilan almashtirilsin',
  },
  {
    label: "has_state",
    type: "function",
    apply: 'has_state("name")',
    detail: "State mavjudligini tekshirish",
  },
  {
    label: "delete_state",
    type: "function",
    apply: 'delete_state("name")',
    detail: "State qiymatni o'chirish",
  },
  {
    label: "set_context",
    type: "function",
    apply: 'set_context("key", value)',
    detail: "(eski) Context yozish — vars.key = value ishlatish tavsiya etiladi",
    info: 'set_context("key", value) → vars.key = value bilan almashtirilsin',
  },
  {
    label: "get_context",
    type: "function",
    apply: 'get_context("key")',
    detail: "(eski) Context o'qish — vars.key ishlatish tavsiya etiladi",
  },
];

interface Props {
  code: string;
  onChange: (value: string) => void;
  globals: string[];
}

export const CodeEditorDialog = ({ code, onChange, globals }: Props) => {
  const inPanel = useIsInNodePanel();

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
          ...HELPER_COMPLETIONS,
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

  // Sidebar'da inline CodeMirror ko'rsatish
  if (inPanel) {
    return (
      <div className="space-y-2">
        {/* Globals badges */}
        {globals.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {globals.map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded text-[10px] border border-yellow-500/20 font-mono"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        <div className="border border-border rounded-md overflow-hidden">
          <CodeMirror
            value={code}
            height="300px"
            theme={vscodeDark}
            className="text-sm"
            extensions={[
              javascript(),
              autocompletion({ override: [customAutocomplete] }),
              linter(() => []),
            ]}
            onChange={onChange}
            basicSetup={{
              lineNumbers: true,
              autocompletion: true,
              bracketMatching: true,
              closeBrackets: true,
            }}
          />
        </div>
      </div>
    );
  }

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
          {/* Globals badges */}
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
