// FAYL: constructor/data/themes.ts

export const themes = {
  dark: {
    name: "dark",
    bg: "bg-black/80 backdrop-blur-sm",
    header: "bg-gray-900/80 border-gray-700/50",
    text: "text-gray-300",
    prompt: "text-gray-500",
    error: "text-red-400",
    info: "text-sky-400",
    warn: "text-yellow-400",
    system: "text-fuchsia-400",
  },
  light: {
    name: "light",
    bg: "bg-white/80 backdrop-blur-sm",
    header: "bg-gray-50/80 border-gray-200",
    text: "text-gray-800",
    prompt: "text-gray-400",
    error: "text-red-600",
    info: "text-sky-600",
    warn: "text-yellow-600",
    system: "text-fuchsia-600",
  },
};

export type Theme = typeof themes.dark;
export type ThemeName = keyof typeof themes;
