"use client";

/**
 * HighlightedInput & HighlightedTextarea
 *
 * Input/Textarea wrapper'lari: foydalanuvchi {{var_name}} yozganda
 * o'sha token joyida rangi o'zgarib ko'rinadi.
 *
 * Arxitektura:
 *   - Wrapper <div>: fon rang, border, rounded, h-* — caller className shu yerga boradi.
 *   - Mirror <div>: bir xil padding/font, {{...}} tokenlarni rangli <span> bilan o'raydi.
 *     pointer-events:none, color:transparent (faqat spanlar ko'rinadi).
 *   - Haqiqiy <input>/<textarea>: bg-transparent, caret, focus ring — faqat interaktiv qism.
 *
 * Muhim: dinamik Tailwind klass ISHLATILMAYDI — inline style + CSS var.
 */

import React, {
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
  type TextareaHTMLAttributes,
  type InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

// ─── Regex ────────────────────────────────────────────────────────────────────

const VAR_TOKEN_RE = /(\{\{[^}]+\}\})/g;

// ─── Token renderer ────────────────────────────────────────────────────────────

/**
 * Matn ichidagi {{...}} tokenlarni rangli <span> bilan almashtiradi.
 * Qolgan qismlar oddiy text node sifatida qaytariladi (color:transparent, invisible).
 */
function highlightTokens(text: string): React.ReactNode[] {
  // split by capture group preserves the delimiters in result array
  const parts = text.split(VAR_TOKEN_RE);
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    // Odd indices are captured matches (the {{ }} tokens)
    if (i % 2 === 1) {
      nodes.push(
        <span
          key={i}
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--primary, hsl(220 90% 56%)) 18%, transparent)",
            color: "var(--primary, hsl(220 90% 56%))",
            borderRadius: "3px",
            padding: "0 2px",
          }}
        >
          {part}
        </span>,
      );
    } else {
      nodes.push(part);
    }
  }
  return nodes;
}

// ─── Mirror font sync ─────────────────────────────────────────────────────────

/**
 * Mirror div'ga haqiqiy input/textarea'ning padding/font stillarini ko'chiradi.
 */
function syncMirrorFont(
  sourceEl: HTMLInputElement | HTMLTextAreaElement,
  mirrorEl: HTMLDivElement,
) {
  const cs = window.getComputedStyle(sourceEl);
  const props = [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "letterSpacing",
    "lineHeight",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "tabSize",
  ] as const;
  for (const prop of props) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mirrorEl.style as any)[prop] = (cs as any)[prop];
  }
}

// ─── HighlightedInput ─────────────────────────────────────────────────────────

export interface HighlightedInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export const HighlightedInput = forwardRef<HTMLInputElement, HighlightedInputProps>(
  function HighlightedInput({ value, onChange, className, style, ...rest }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const mirrorRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const syncScroll = useCallback(() => {
      if (!inputRef.current || !mirrorRef.current) return;
      mirrorRef.current.scrollLeft = inputRef.current.scrollLeft;
    }, []);

    useEffect(() => {
      if (!inputRef.current || !mirrorRef.current) return;
      syncMirrorFont(inputRef.current, mirrorRef.current);
    });

    return (
      /*
       * Wrapper div carries the visual styles (background, border, rounded, height).
       * caller's className (e.g. "h-10 border-white/10 bg-zinc-950/60") goes here.
       */
      <div
        className={cn(
          // Base visual shell — matches Shadcn Input appearance
          "relative flex min-w-0 w-full rounded-md border border-input",
          "shadow-xs overflow-hidden",
          className,
        )}
        style={style}
      >
        {/* Mirror — behind the real input; color:transparent so only spans show */}
        <div
          ref={mirrorRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
            color: "transparent",
            whiteSpace: "pre",
            // border transparent (same width as input border = 1px via wrapper)
            border: "0px solid transparent",
            zIndex: 0,
          }}
        >
          {highlightTokens(value)}
          {/* Trailing zero-width space keeps height consistent when empty */}
          {"​"}
        </div>

        {/* Real input — bg-transparent so mirror layer shows through */}
        <input
          ref={inputRef}
          value={value}
          onChange={onChange}
          onScroll={syncScroll}
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground",
            "selection:bg-primary selection:text-primary-foreground",
            "flex h-9 w-full min-w-0 bg-transparent",
            "px-3 py-1 text-base outline-none",
            "file:inline-flex file:h-7 file:border-0 file:bg-transparent",
            "file:text-sm file:font-medium",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "md:text-sm",
            "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          )}
          style={{
            position: "relative",
            zIndex: 1,
            caretColor: "var(--foreground)",
          }}
          {...rest}
        />
      </div>
    );
  },
);

// ─── HighlightedTextarea ──────────────────────────────────────────────────────

export interface HighlightedTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
}

export const HighlightedTextarea = forwardRef<
  HTMLTextAreaElement,
  HighlightedTextareaProps
>(function HighlightedTextarea(
  { value, onChange, className, style, rows, ...rest },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  const syncScroll = useCallback(() => {
    if (!textareaRef.current || !mirrorRef.current) return;
    mirrorRef.current.scrollTop = textareaRef.current.scrollTop;
    mirrorRef.current.scrollLeft = textareaRef.current.scrollLeft;
  }, []);

  useEffect(() => {
    if (!textareaRef.current || !mirrorRef.current) return;
    syncMirrorFont(textareaRef.current, mirrorRef.current);
    mirrorRef.current.style.height = `${textareaRef.current.offsetHeight}px`;
    mirrorRef.current.style.width = `${textareaRef.current.offsetWidth}px`;
  });

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-md border border-input shadow-xs",
        className,
      )}
      style={style}
    >
      {/* Mirror */}
      <div
        ref={mirrorRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          overflow: "hidden",
          color: "transparent",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          border: "0px solid transparent",
          zIndex: 0,
        }}
      >
        {highlightTokens(value)}
        {/* Trailing newline keeps mirror height in sync */}
        {"\n​"}
      </div>

      {/* Real textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onScroll={syncScroll}
        rows={rows}
        className={cn(
          "placeholder:text-muted-foreground",
          "selection:bg-primary selection:text-primary-foreground",
          "flex field-sizing-content min-h-16 w-full bg-transparent",
          "px-3 py-2 text-base outline-none",
          "transition-[color,box-shadow]",
          "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        )}
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "transparent",
          caretColor: "var(--foreground)",
          resize: "vertical",
        }}
        {...rest}
      />
    </div>
  );
});
