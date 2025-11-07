import type { editor } from "monaco-editor";

export const botfatherTheme: editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [
    // Umumiy ranglar
    { token: "comment", foreground: "#6272A4", fontStyle: "italic" }, // Izohlar
    { token: "keyword", foreground: "#FF79C6" }, // if, for, def, import
    { token: "string", foreground: "#F1FA8C" }, // "Salom dunyo" kabi matnlar
    { token: "constant.numeric", foreground: "#BD93F9" }, // 1, 2, 3.14 kabi sonlar
    { token: "constant.language", foreground: "#BD93F9" }, // True, False, None
    { token: "keyword", foreground: "#C586C0", fontStyle: "bold" },
    { token: "storage.type", foreground: "#C586C0" },
    { token: "storage.modifier", foreground: "#C586C0" },

    // Funksiya va klasslar
    { token: "entity.name.function", foreground: "#50FA7B" }, // Funksiya nomlari (send_animation)
    { token: "support.function", foreground: "#50FA7B" },
    { token: "entity.name.class", foreground: "#8BE9FD", fontStyle: "italic" }, // Klass nomlari (Bot, Message)
    { token: "entity.name.type", foreground: "#8BE9FD", fontStyle: "italic" },

    // O'zgaruvchilar va parametrlar
    { token: "variable", foreground: "#FFFFFF" }, // Asosiy o'zgaruvchilar (bot, dp)
    { token: "variable.parameter", foreground: "#9CDCFE", fontStyle: "italic" },
    { token: "entity.name.tag", foreground: "#569CD6" },
    { token: "entity.other.attribute-name", foreground: "#9CDCFE" },

    // Operatorlar
    { token: "keyword.operator", foreground: "#D4D4D4" },
  ],
  colors: {
    // Asosiy fon va matn
    "editor.background": "#1A1D2A", // Chuqur, salat tusli to'q ko'k
    "editor.foreground": "#D4D4D4", // Yumshoq oq

    // Kursor va ajratilgan qator
    "editorCursor.foreground": "#3794FF", // Yorqin, diqqatni tortuvchi ko'k
    "editor.lineHighlightBackground": "#22263C", // Orqa fonidan sal yorqinroq

    // Snippetlar uchun eng muhim joy!
    "editor.snippetTabstopBackground": "#3794FF4D", // Aktiv placeholder foni (30% shaffoflik bilan)
    "editor.snippetTabstopBorder": "#3794FF", // Aktiv placeholder chegarasi (yorqin!)
    "editor.snippetFinalTabstopBackground": "#22263C", // Oxirgi to'xtash joyi (kamroq bilinadi)
    "editor.snippetFinalTabstopBorder": "#6A737D", // Oxirgi to'xtash joyi chegarasi

    // Boshqa UI elementlari
    "editor.selectionBackground": "#3A3D4A",
    "editorWidget.background": "#21252B",
    "editorWidget.border": "#3794FF",
    "sideBar.background": "#181A26",
    "sideBar.border": "#22263C",
    "activityBar.background": "#181A26",
    "tab.activeBackground": "#1A1D2A",
    "tab.activeBorder": "#3794FF",
    "tab.inactiveBackground": "#181A26",
    "statusBar.background": "#181A26",
    "statusBar.border": "#22263C",
  },
};
