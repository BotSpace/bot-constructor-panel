"use client";

/**
 * HighlightedInput & HighlightedTextarea
 *
 * Input/Textarea wrapper'lari: foydalanuvchi {{var_name}} yozganda
 * o'sha token joyida rangli ko'rinadi. Dropdown autocomplete ham bor.
 *
 * Arxitektura (to'g'ri overlay texnikasi):
 *   - Wrapper <div>: fon rang, border, rounded, h-* — caller className shu yerga boradi.
 *   - Mirror <div>: butun matnni ko'rsatadi — oddiy qismlar var(--foreground),
 *     {{...}} tokenlar accent rang. zIndex 0 (orqada).
 *   - Haqiqiy <input>/<textarea>: color:transparent (caret va selection ko'rinadi),
 *     bg-transparent, zIndex 1 (ustda). Shu bilan matn FAQAT mirror orqali ko'rinadi,
 *     dubl/ghost yo'q.
 *
 * Muhim: dinamik Tailwind klass ISHLATILMAYDI — inline style + CSS var.
 *
 * VAZIFA C FIX: Dropdown position:fixed + getBoundingClientRect — overflow:hidden
 * ancestor'lardan chiqib ketmaydi. ReactDOM.createPortal ishlatilmaydi chunki
 * Next.js SSR, shuning uchun useEffect ichida mount'dan keyin render qilinadi.
 *
 * VAZIFA D: Snippet/konstruksiyalar ({{#each}}, {{#if}}) ham tavsiya qilinadi.
 */

import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  type TextareaHTMLAttributes,
  type InputHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

// ─── Regex ────────────────────────────────────────────────────────────────────

const VAR_TOKEN_RE = /(\{\{[^}]+\}\})/g;

// ─── Snippet tizimi ───────────────────────────────────────────────────────────

interface Snippet {
  /** Autocomplete ro'yxatida ko'rinadigan label */
  label: string;
  /** Dropdown'da ko'rinadigan hint (tur) */
  kind: "loop" | "condition" | "context";
  /**
   * Insertga qo'yiladigan matn. `|` belgisi kursor joyi.
   * Textarea'da ko'p qatorli, input'da bir qatorli versiyasi ishlatiladi.
   */
  insertMultiline: string;
  insertSingleLine: string;
  /** Filter trigger: shu prefix yozilganda ustuvor ko'rinadi */
  triggerPrefix: string;
}

const SNIPPETS: Snippet[] = [
  {
    label: "#each — Ro'yxat (loop)",
    kind: "loop",
    triggerPrefix: "#",
    insertMultiline: "{{#each collection.items}}\n  {{this.field}}\n{{/each}}",
    insertSingleLine: "{{#each collection.items}} {{this.field}} {{/each}}",
  },
  {
    label: "#if — Shart",
    kind: "condition",
    triggerPrefix: "#",
    insertMultiline: "{{#if variable}}\n  \n{{/if}}",
    insertSingleLine: "{{#if variable}} {{/if}}",
  },
  {
    label: "@index — Tartib raqami (0 dan)",
    kind: "context",
    triggerPrefix: "@",
    insertMultiline: "{{@index}}",
    insertSingleLine: "{{@index}}",
  },
  {
    label: "@number — Tartib raqami (1 dan)",
    kind: "context",
    triggerPrefix: "@",
    insertMultiline: "{{@number}}",
    insertSingleLine: "{{@number}}",
  },
  {
    label: "this — Joriy element",
    kind: "context",
    triggerPrefix: "",
    insertMultiline: "{{this}}",
    insertSingleLine: "{{this}}",
  },
];

/** Snippet yoki oddiy o'zgaruvchi ifodalovchi birlik */
interface SuggestionItem {
  id: string;
  display: string;
  isSnippet: boolean;
  kind?: "loop" | "condition" | "context";
  insertMultiline: string;
  insertSingleLine: string;
}

function buildItems(suggestions: string[], query: string): SuggestionItem[] {
  const q = query.toLowerCase();
  // Snippet'lar: "#" yoki "@" trigger bo'lsa ustuvor
  const isSnippetQuery = query.startsWith("#") || query.startsWith("@");
  const snippetItems: SuggestionItem[] = SNIPPETS.filter((s) => {
    if (isSnippetQuery) {
      return s.label.toLowerCase().includes(q) || s.triggerPrefix === query[0];
    }
    return q === "" || s.label.toLowerCase().includes(q) || s.triggerPrefix.startsWith(q);
  }).map((s) => ({
    id: `__snippet__${s.label}`,
    display: s.label,
    isSnippet: true,
    kind: s.kind,
    insertMultiline: s.insertMultiline,
    insertSingleLine: s.insertSingleLine,
  }));

  // Oddiy o'zgaruvchilar (snippet query bo'lsa kam ko'rinsin)
  const varItems: SuggestionItem[] = suggestions
    .filter((s) => q === "" || s.toLowerCase().includes(q))
    .map((s) => ({
      id: s,
      display: `{{${s}}}`,
      isSnippet: false,
      insertMultiline: `{{${s}}}`,
      insertSingleLine: `{{${s}}}`,
    }));

  // "#" yozilganda faqat snippet'lar; boshqa holda ikkalasi
  if (isSnippetQuery) return snippetItems;
  return [...snippetItems, ...varItems];
}

// ─── Token renderer ────────────────────────────────────────────────────────────

function highlightTokens(text: string): React.ReactNode[] {
  const parts = text.split(VAR_TOKEN_RE);
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    if (i % 2 === 1) {
      nodes.push(
        <span
          key={i}
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--primary, hsl(220 90% 56%)) 18%, transparent)",
            color: "var(--primary, hsl(220 90% 56%))",
            borderRadius: "3px",
          }}
        >
          {part}
        </span>,
      );
    } else {
      nodes.push(
        <span key={i} style={{ color: "var(--foreground)" }}>
          {part}
        </span>,
      );
    }
  }
  return nodes;
}

// ─── Mirror font sync ─────────────────────────────────────────────────────────

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
    "boxSizing",
    "textAlign",
  ] as const;
  for (const prop of props) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mirrorEl.style as any)[prop] = (cs as any)[prop];
  }
}

// ─── Dropdown portal (position:fixed) ────────────────────────────────────────

interface DropdownPortalProps {
  open: boolean;
  items: SuggestionItem[];
  activeIndex: number;
  anchorRef: React.RefObject<HTMLElement | null>;
  onSelect: (item: SuggestionItem) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

function DropdownPortal({
  open,
  items,
  activeIndex,
  anchorRef,
  onSelect,
  onMouseDown,
}: DropdownPortalProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Client-side only
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !anchorRef.current) {
      setRect(null);
      return;
    }
    const el = anchorRef.current;
    const r = el.getBoundingClientRect();
    // position:fixed is viewport-relative — no scroll offset needed
    setRect({ top: r.bottom + 2, left: r.left, width: r.width });
  }, [open, anchorRef]);

  useEffect(() => {
    if (open && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeIndex]);

  if (!mounted || !open || items.length === 0 || !rect) return null;

  const kindColors: Record<string, string> = {
    loop: "hsl(200 80% 60%)",
    condition: "hsl(280 70% 65%)",
    context: "hsl(160 60% 55%)",
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        backgroundColor: "var(--popover)",
        color: "var(--popover-foreground)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        maxHeight: "220px",
        overflowY: "auto",
        padding: "4px",
      }}
      onMouseDown={onMouseDown}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const accentColor = item.isSnippet && item.kind ? kindColors[item.kind] : "var(--primary)";
        return (
          <button
            key={item.id}
            ref={isActive ? activeRef : undefined}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(item);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              width: "100%",
              textAlign: "left",
              padding: "5px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontFamily: item.isSnippet ? "inherit" : "var(--font-mono, monospace)",
              cursor: "pointer",
              border: "none",
              backgroundColor: isActive
                ? "color-mix(in srgb, var(--primary) 15%, transparent)"
                : "transparent",
              color: isActive ? accentColor : "var(--popover-foreground)",
            }}
          >
            {item.isSnippet ? (
              <span
                style={{
                  fontSize: 10,
                  padding: "1px 4px",
                  borderRadius: 3,
                  backgroundColor: "color-mix(in srgb, " + accentColor + " 20%, transparent)",
                  color: accentColor,
                  fontFamily: "var(--font-mono, monospace)",
                  flexShrink: 0,
                  letterSpacing: "0.02em",
                }}
              >
                {item.kind === "loop" ? "loop" : item.kind === "condition" ? "if" : "ctx"}
              </span>
            ) : null}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.display}
            </span>
          </button>
        );
      })}
    </div>,
    document.body
  );
}

// ─── useVarAutocomplete hook ──────────────────────────────────────────────────

interface AutocompleteState {
  open: boolean;
  query: string;
  items: SuggestionItem[];
  activeIndex: number;
}

interface UseVarAutocompleteOptions {
  suggestions: string[];
  getValue: () => string;
  getCaretPosition: () => number;
  /** multiline: textarea mode (ko'p qatorli snippet) */
  multiline?: boolean;
  setValue: (next: string, caretPos: number) => void;
}

function getOpenQueryFromValue(value: string, caretPos: number): string | null {
  const before = value.slice(0, caretPos);
  const lastOpen = before.lastIndexOf("{{");
  if (lastOpen === -1) return null;
  const afterOpen = before.slice(lastOpen + 2);
  if (afterOpen.includes("}}")) return null;
  return afterOpen;
}

function useVarAutocomplete({
  suggestions,
  getValue,
  getCaretPosition,
  multiline = false,
  setValue,
}: UseVarAutocompleteOptions) {
  const [state, setState] = useState<AutocompleteState>({
    open: false,
    query: "",
    items: [],
    activeIndex: 0,
  });

  const checkTriggerFromArgs = useCallback(
    (value: string, caret: number) => {
      const query = getOpenQueryFromValue(value, caret);
      if (query === null) {
        setState((prev) => (prev.open ? { ...prev, open: false } : prev));
        return;
      }
      const items = buildItems(suggestions, query);
      setState({
        open: items.length > 0,
        query,
        items,
        activeIndex: 0,
      });
    },
    [suggestions],
  );

  const checkTrigger = useCallback(() => {
    const value = getValue();
    const caret = getCaretPosition();
    checkTriggerFromArgs(value, caret);
  }, [getValue, getCaretPosition, checkTriggerFromArgs]);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const selectItem = useCallback(
    (item: SuggestionItem) => {
      const value = getValue();
      const caret = getCaretPosition();
      const before = value.slice(0, caret);
      const after = value.slice(caret);
      const lastOpen = before.lastIndexOf("{{");
      if (lastOpen === -1) return;

      const insert = multiline ? item.insertMultiline : item.insertSingleLine;
      // Snippet ichida kursor joyi — faqat loop/condition snippet'larida mantiqli
      // Snippet matnini "{{" oldidan boshlash o'rniga to'g'ri joyga qo'yamiz
      const newBefore = before.slice(0, lastOpen) + insert;
      const newValue = newBefore + after;
      // Kursor: snippet'lar uchun ohiriga qo'y ({{...}} ichiga kirish foydalanuvchiga qoladi)
      const newCaret = newBefore.length;
      setValue(newValue, newCaret);
      close();
    },
    [getValue, getCaretPosition, multiline, setValue, close],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!state.open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          activeIndex: (prev.activeIndex + 1) % Math.max(prev.items.length, 1),
        }));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          activeIndex:
            (prev.activeIndex - 1 + Math.max(prev.items.length, 1)) %
            Math.max(prev.items.length, 1),
        }));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        if (state.items.length > 0) {
          e.preventDefault();
          selectItem(state.items[state.activeIndex] ?? state.items[0]);
        }
        return;
      }
    },
    [state, close, selectItem],
  );

  return { state, checkTrigger, checkTriggerFromArgs, close, selectItem, handleKeyDown };
}

// ─── HighlightedInput ─────────────────────────────────────────────────────────

export interface HighlightedInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  suggestions?: string[];
}

export const HighlightedInput = forwardRef<HTMLInputElement, HighlightedInputProps>(
  function HighlightedInput(
    { value, onChange, className, style, suggestions = [], ...rest },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const mirrorRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const syncScroll = useCallback(() => {
      if (!inputRef.current || !mirrorRef.current) return;
      mirrorRef.current.scrollLeft = inputRef.current.scrollLeft;
    }, []);

    useEffect(() => {
      if (!inputRef.current || !mirrorRef.current) return;
      syncMirrorFont(inputRef.current, mirrorRef.current);
    });

    const { state, checkTriggerFromArgs, close, selectItem, handleKeyDown } =
      useVarAutocomplete({
        suggestions,
        multiline: false,
        getValue: () => inputRef.current?.value ?? "",
        getCaretPosition: () => inputRef.current?.selectionStart ?? 0,
        setValue: (next, caretPos) => {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value",
          )?.set;
          if (nativeInputValueSetter && inputRef.current) {
            nativeInputValueSetter.call(inputRef.current, next);
            inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
            requestAnimationFrame(() => {
              if (inputRef.current) {
                inputRef.current.setSelectionRange(caretPos, caretPos);
              }
            });
          }
        },
      });

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e);
        const val = e.target.value;
        const caret = e.target.selectionStart ?? val.length;
        checkTriggerFromArgs(val, caret);
      },
      [onChange, checkTriggerFromArgs],
    );

    return (
      <div
        ref={wrapperRef}
        className={cn(
          "relative flex min-w-0 w-full rounded-md border border-input",
          "shadow-xs overflow-visible",
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
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
            whiteSpace: "pre",
            border: "0px solid transparent",
            zIndex: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ whiteSpace: "pre" }}>
            {highlightTokens(value)}
            {"​"}
          </span>
        </div>

        {/* Real input */}
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          onBlur={close}
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground",
            "selection:bg-primary/30",
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
            color: "transparent",
            caretColor: "var(--foreground)",
          }}
          {...rest}
        />

        {/* Dropdown — position:fixed portal */}
        <DropdownPortal
          open={state.open}
          items={state.items}
          activeIndex={state.activeIndex}
          anchorRef={wrapperRef}
          onSelect={selectItem}
          onMouseDown={(e) => e.preventDefault()}
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
  suggestions?: string[];
}

export const HighlightedTextarea = forwardRef<
  HTMLTextAreaElement,
  HighlightedTextareaProps
>(function HighlightedTextarea(
  { value, onChange, className, style, rows, suggestions = [], ...rest },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const { state, checkTriggerFromArgs, close, selectItem, handleKeyDown } =
    useVarAutocomplete({
      suggestions,
      multiline: true,
      getValue: () => textareaRef.current?.value ?? "",
      getCaretPosition: () => textareaRef.current?.selectionStart ?? 0,
      setValue: (next, caretPos) => {
        const nativeValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value",
        )?.set;
        if (nativeValueSetter && textareaRef.current) {
          nativeValueSetter.call(textareaRef.current, next);
          textareaRef.current.dispatchEvent(new Event("input", { bubbles: true }));
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.setSelectionRange(caretPos, caretPos);
            }
          });
        }
      },
    });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e);
      const val = e.target.value;
      const caret = e.target.selectionStart ?? val.length;
      checkTriggerFromArgs(val, caret);
    },
    [onChange, checkTriggerFromArgs],
  );

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative w-full overflow-visible rounded-md border border-input shadow-xs",
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
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          border: "0px solid transparent",
          zIndex: 0,
        }}
      >
        {highlightTokens(value)}
        {"\n​"}
      </div>

      {/* Real textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        onBlur={close}
        rows={rows}
        className={cn(
          "placeholder:text-muted-foreground",
          "selection:bg-primary/30",
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
          color: "transparent",
          caretColor: "var(--foreground)",
          resize: "vertical",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
        {...rest}
      />

      {/* Dropdown — position:fixed portal */}
      <DropdownPortal
        open={state.open}
        items={state.items}
        activeIndex={state.activeIndex}
        anchorRef={wrapperRef}
        onSelect={selectItem}
        onMouseDown={(e) => e.preventDefault()}
      />
    </div>
  );
});
