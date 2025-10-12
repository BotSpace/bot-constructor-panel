"use client";

import { useEffect } from "react";

export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  options: { preventDefault?: boolean } = {}
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKeys = [
        event.ctrlKey && "Control",
        event.shiftKey && "Shift",
        event.altKey && "Alt",
        event.metaKey && "Meta",
        event.key,
      ].filter(Boolean) as string[];

      const isMatch = keys.every((key) =>
        pressedKeys.some(
          (pressed) => pressed.toLowerCase() === key.toLowerCase()
        )
      );

      if (isMatch) {
        if (options.preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keys, callback, options]);
}
