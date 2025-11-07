"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react"; // useEffect va useRef'ni import qilamiz
import { EditorSetup } from "./setup";
import { useEditorSettings } from "./store";

// Monokai mavzusini import qilamiz
import monokaiTheme from "monaco-themes/themes/Monokai.json";
import { ayuMirageTheme } from "./themes/ayu-mirage"; // YANGI IMPORT
import { botfatherTheme } from "./themes/botfather";
import { CodeExecutionContext } from "@/features/bot-constructor/nodes/custom/CustomCodeNode/types";

type Props = {
  initialCode: string;
  onSave: (newCode: string) => void;
  contextType: CodeExecutionContext;
};

export default function AiogramEditor({
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
    monacoRef.current = monaco; // Monaco instansiyasini saqlab qo'yamiz

    // Yangi mavzularni ro'yxatdan o'tkazamiz
    monaco.editor.defineTheme("monokai", monokaiTheme);
    monaco.editor.defineTheme("ayu-mirage", ayuMirageTheme); // YANGI MAVZUNI RO'YXATDAN O'TKAZAMIZ
    monaco.editor.defineTheme("botfather", botfatherTheme); // YANGI MAVZUNI RO'YXATDAN O'TKAZAMIZ

    // Boshlang'ich mavzuni o'rnatamiz
    monaco.editor.setTheme(theme);

    // Bizning Aiogram sozlamalarimizni ishga tushiramiz
    EditorSetup(monaco);
  }

  return (
    <div className="h-screen flex flex-col bg-[#1E1E1E] rounded-3xl p-2 overflow-hidden relative">
      <div className="flex-1 relative">
        <div className="pl-10 text-gray-500 select-none pointer-events-none">
          {contextType == "callback" ? (
            <code>def myFunction(callback: types.Callback)</code>
          ) : (
            <code>def myFunction(message: types.Message)</code>
          )}
        </div>
        <Editor
          height="100%"
          language="python"
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
            scrollBeyondLastLine: false,
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
      </div>
    </div>
  );
}
