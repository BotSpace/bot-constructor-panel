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
import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";

// Custom code uchun state/context yordamchi funksiyalari (autocomplete).
//
// YANGI (tavsiya etilgan) — to'g'ridan-to'g'ri obyekt-access:
//   context.var_name   — context o'zgaruvchisini o'qish (masalan: context.first_name)
//   state.var_name     — state o'zgaruvchisini o'qish; 'state_' prefiksi AVTOMATIK
//                        (masalan: state.count → state_count kalit ostida saqlangan)
//
// ESKI (hali ham ishlaydi) — funksiya orqali:
//   get_context("key") / set_context("key", value)
//   get_state("name")  / set_state("name", value)  — 'state_' avtomatik qo'shiladi

const HELPER_COMPLETIONS = [
  // --- Obyekt-access (yangi, tavsiya etilgan) ---
  {
    label: "context",
    type: "variable",
    boost: 100,
    detail: "Context obyekti — barcha context o'zgaruvchilar",
    info: "context.var_name — to'g'ridan-to'g'ri o'qish. Masalan: context.first_name, context.sheets_response",
  },
  {
    label: "context.",
    type: "variable",
    boost: 100,
    apply: "context.",
    detail: "context.var_name — context o'zgaruvchisini o'qish",
    info: "Masalan: context.first_name, context.user_input, context.sheets_response",
  },
  {
    label: "state",
    type: "variable",
    boost: 100,
    detail: "State obyekti — barcha state o'zgaruvchilar (state_ prefikssiz)",
    info: "state.var_name — to'g'ridan-to'g'ri o'qish. Masalan: state.count, state.step",
  },
  {
    label: "state.",
    type: "variable",
    boost: 100,
    apply: "state.",
    detail: "state.var_name — state o'zgaruvchisini o'qish",
    info: "Masalan: state.count, state.step, state.user_choice. 'state_' prefiksi avtomatik.",
  },
  // --- Funksiyalar (eski, hali ham ishlaydi) ---
  {
    label: "set_state",
    type: "function",
    apply: 'set_state("name", value)',
    detail: "State yozish — 'state_' avtomatik qo'shiladi",
    info: 'set_state("name", value) → node maydonida {{name}} yoki {{state.name}}',
  },
  {
    label: "get_state",
    type: "function",
    apply: 'get_state("name")',
    detail: "State o'qish — 'state_' avtomatik qo'shiladi",
    info: 'get_state("name") → state_name qiymatini qaytaradi',
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
    detail: "Context yozish — prefiks YO'Q (kalit o'zgarmaydi)",
    info: 'set_context("key", value) → node maydonida {{key}}',
  },
  {
    label: "get_context",
    type: "function",
    apply: 'get_context("key")',
    detail: "Context qiymatni o'qish",
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

        {/* Variable access help */}
        <div className="rounded-md border border-blue-500/20 bg-blue-500/5 px-2.5 py-1.5 text-[10px] text-blue-400 leading-relaxed">
          <span className="font-semibold">O&apos;qish:</span>{" "}
          <code className="font-mono">context.var_name</code> · <code className="font-mono">state.var_name</code>
          <span className="mx-1 text-blue-500/50">|</span>
          <span className="font-semibold">Yozish:</span>{" "}
          <code className="font-mono">set_context(&quot;key&quot;, val)</code> · <code className="font-mono">set_state(&quot;name&quot;, val)</code>
        </div>

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

        <p className="flex items-center gap-1 text-xs text-muted-foreground italic">
          <AlertCircle className="w-3 h-3" />
          Kod faqat serverda ishga tushadi.
        </p>
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
          {/* Variable access help banner */}
          <div className="mt-2 rounded-md border border-blue-500/20 bg-blue-500/8 px-3 py-2 text-[11px] text-blue-300 leading-relaxed">
            <span className="font-semibold text-blue-200">O&apos;qish (tavsiya):</span>{" "}
            <code className="font-mono text-emerald-300">context.var_name</code>
            <span className="mx-1.5 text-slate-600">·</span>
            <code className="font-mono text-emerald-300">state.var_name</code>
            <span className="mx-2 text-slate-600">|</span>
            <span className="font-semibold text-blue-200">Yozish:</span>{" "}
            <code className="font-mono text-yellow-300">set_context(&quot;key&quot;, val)</code>
            <span className="mx-1.5 text-slate-600">·</span>
            <code className="font-mono text-yellow-300">set_state(&quot;name&quot;, val)</code>
            <span className="ml-2 text-[10px] text-slate-500">(get_context/get_state ham ishlaydi)</span>
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
