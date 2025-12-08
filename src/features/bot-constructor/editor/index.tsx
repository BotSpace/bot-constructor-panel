"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react"; // useEffect va useRef'ni import qilamiz
import { EditorSetup } from "./setup";
import { useEditorSettings } from "./store";

// Monaco themes
import { monokaiTheme } from "./themes/monokai";
import { ayuMirageTheme } from "./themes/ayu-mirage";
import { botfatherTheme } from "./themes/botfather";
import { CodeExecutionContext } from "@/features/bot-constructor/nodes/custom/CustomCodeNode/types";

type Props = {
  initialCode: string;
  onSave: (newCode: string) => void;
  contextType: CodeExecutionContext;
};

export default function CodeEditor({
  onSave,
  contextType,
  initialCode,
}: Props) {
  const { theme, ...settings } = useEditorSettings(); // `theme` ni alohida olamiz
  const monacoRef = useRef<any>(null); // Monaco instansiyasini saqlash uchun ref

  const {
    folding,
    minimap,
    fontFamily,
    fontSize,
    lineNumbers,
    renderWhitespace,
    wordWrap,
  } = useEditorSettings();

  // Mavzu o'zgarganda uni yangilab turish uchun useEffect
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme);
    }
  }, [theme]);
  function handleEditorMount(editor: any, monaco: any) {
    monacoRef.current = monaco;

    // 1. Mavzularni ro'yxatdan o'tkazish (o'zgarishsiz)
    monaco.editor.defineTheme("monokai", monokaiTheme);
    monaco.editor.defineTheme("ayu-mirage", ayuMirageTheme);
    monaco.editor.defineTheme("botfather", botfatherTheme);

    monaco.editor.setTheme(theme);

    // ---------------------------------------------------------
    // 2. GLOBAL FUNKSIYALARNI QO'SHISH (LSP)
    // ---------------------------------------------------------

    // Global funksiyalar va o'zgaruvchilar ta'rifi (Type Definition)
    const libSource = `
    /**
     * Foydalanuvchiga xabar yuborish funksiyasi.
     * 
     * @param text - Yuboriladigan xabar matni
     * @example
     * send_message("Salom dunyo!");
     */
    declare function send_message(text: string): void;

    /**
     * Yana bir misol: Global o'zgaruvchi
     */
    declare const contextType: string;
    
    /**
     * Konsolga ma'lumot chiqarish
     */ 
    declare const console: {
        log(...args: any[]): void;
        error(...args: any[]): void;
    };
  `;

    // JavaScript va TypeScript sozlamalarini to'g'irlash
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES6,
      allowNonTsExtensions: true, // JS fayllarda ham ishlashi uchun
    });

    // Ta'rifni "kutubxona" sifatida qo'shish
    // Eslatma: 'ts:filename/globals.d.ts' bu shunchaki unikal virtual yo'l
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      libSource,
      "ts:filename/globals.d.ts"
    );
    // ---------------------------------------------------------

    // Bizning Aiogram sozlamalarimizni ishga tushiramiz
    EditorSetup(monaco);
  }
  return (
    <Editor
      height="100%"
      language="javascript"
      defaultValue={initialCode}
      onMount={handleEditorMount} // Yangi onMount funksiyamiz
      onChange={(e) => onSave(e || "")}
      options={{
        minimap: {
          enabled: minimap,
        },
        fontSize: fontSize,
        fontFamily: fontFamily,
        lineHeight: fontSize * 1.5,
        wordWrap: wordWrap ? "on" : "off",
        lineNumbers: lineNumbers ? "on" : "off",
        folding: folding,
        renderWhitespace: renderWhitespace ? "all" : "none",
        automaticLayout: true,
        scrollBeyondLastLine: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: "line",
        scrollbar: {
          vertical: "visible",
          horizontal: "visible",
        },
        // Enhanced styling
        padding: {
          top: 16,
          bottom: 16,
        },
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        renderLineHighlight: "all",
        selectOnLineNumbers: true,
        foldingStrategy: "indentation",
        showFoldingControls: "always",
        foldingHighlight: true,
        foldingImportsByDefault: true,
        unfoldOnClickAfterEndOfLine: false,
        links: true,
        colorDecorators: true,
        suggest: {
          showKeywords: true,
          showSnippets: true,
          showClasses: true,
          showFunctions: true,
          showVariables: true,
          showConstants: true,
          showEnums: true,
          showEnumMembers: true,
          showColors: true,
          showFiles: true,
          showReferences: true,
          showFolders: true,
          showTypeParameters: true,
          showWords: true,
          showUsers: true,
          showIssues: true,
        },
      }}
    />
  );
}
