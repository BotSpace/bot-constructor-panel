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
        event.ctrlKey ? "Control" : null,
        event.shiftKey ? "Shift" : null,
        event.altKey ? "Alt" : null,
        event.metaKey ? "Meta" : null,
        event.key,
      ].filter(Boolean) as string[];

      // EXACT MATCH
      const normalizedPressed = pressedKeys.map(k => k.toLowerCase()).sort();
      const normalizedKeys = keys.map(k => k.toLowerCase()).sort();

      const isMatch =
        normalizedPressed.length === normalizedKeys.length &&
        normalizedPressed.every((k, i) => k === normalizedKeys[i]);

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