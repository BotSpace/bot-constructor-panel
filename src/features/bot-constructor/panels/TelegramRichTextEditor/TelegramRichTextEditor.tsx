"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIsInNodePanel } from "@/features/bot-constructor/hooks/NodePanelContext";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Quote,
    Undo2,
    Redo2,
    X,
} from "lucide-react";
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { VariableHighlightExtension } from "./variableHighlight";

const TELEGRAM_INLINE_TAGS = new Set([
    "b", "strong", "i", "em", "u", "ins", "s", "strike", "del", "code", "a",
]);

function tiptapToTelegramHTML(html: string): string {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;

    function processInline(el: Element): string {
        let out = "";
        for (const node of Array.from(el.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE) {
                out += node.textContent ?? "";
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const child = node as HTMLElement;
                const tag = child.tagName.toLowerCase();
                if (tag === "br") {
                    out += "\n";
                } else if (TELEGRAM_INLINE_TAGS.has(tag)) {
                    const attrs =
                        tag === "a"
                            ? ` href="${child.getAttribute("href") ?? ""}"`
                            : "";
                    out += `<${tag}${attrs}>${processInline(child)}</${tag}>`;
                } else {
                    out += processInline(child);
                }
            }
        }
        return out;
    }

    function processBlock(el: HTMLElement): string {
        const tag = el.tagName.toLowerCase();

        if (tag === "blockquote") {
            const lines: string[] = [];
            for (const child of Array.from(el.childNodes)) {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    lines.push(processInline(child as HTMLElement));
                } else if (child.nodeType === Node.TEXT_NODE) {
                    const t = child.textContent ?? "";
                    if (t.trim()) lines.push(t);
                }
            }
            return `<blockquote>${lines.join("\n")}</blockquote>`;
        }

        if (tag === "pre") {
            const codeEl = el.querySelector("code");
            if (codeEl) {
                const lang = codeEl.className?.match(/language-(\S+)/)?.[1];
                return lang
                    ? `<pre><code class="language-${lang}">${codeEl.textContent ?? ""}</code></pre>`
                    : `<pre><code>${codeEl.textContent ?? ""}</code></pre>`;
            }
            return `<pre>${el.textContent ?? ""}</pre>`;
        }

        if (tag === "p") {
            const content = processInline(el);
            return content.replace(/^\n+$/, "");
        }

        return processInline(el);
    }

    const blocks: string[] = [];
    for (const node of Array.from(div.childNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            blocks.push(processBlock(node as HTMLElement));
        } else if (node.nodeType === Node.TEXT_NODE) {
            const t = node.textContent ?? "";
            if (t.trim()) blocks.push(t);
        }
    }

    return blocks.join("\n").replace(/\n+$/, "");
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    tooltip: string;
    shortcut?: string;
    children: React.ReactNode;
}

function ToolbarButton({
    onClick,
    isActive,
    tooltip,
    shortcut,
    children,
}: ToolbarButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    onClick={onClick}
                    className={cn(
                        "inline-flex items-center justify-center size-8 rounded-md transition-all duration-150",
                        "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                        isActive &&
                        "bg-foreground/10 text-foreground shadow-sm"
                    )}
                >
                    {children}
                </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
                <span>{tooltip}</span>
                {shortcut && (
                    <kbd className="ml-1.5 text-[10px] opacity-60 font-mono">
                        {shortcut}
                    </kbd>
                )}
            </TooltipContent>
        </Tooltip>
    );
}

function EditorToolbar({
    editor,
}: {
    editor: Editor | null;
}) {
    if (!editor) return null;

    return (
        <div className="flex items-center gap-0.5 px-2 py-1.5">
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                tooltip="Qalin"
                shortcut="⌘B"
            >
                <Bold className="size-4" strokeWidth={2} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                tooltip="Kursiv"
                shortcut="⌘I"
            >
                <Italic className="size-4" strokeWidth={2} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")}
                tooltip="Tagiga chizish"
                shortcut="⌘U"
            >
                <UnderlineIcon className="size-4" strokeWidth={2} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
                tooltip="O'chirilgan"
                shortcut="⌘⇧S"
            >
                <Strikethrough className="size-4" strokeWidth={2} />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1.5 h-5!" />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive("code")}
                tooltip="Inline kod"
                shortcut="⌘E"
            >
                <Code className="size-4" strokeWidth={2} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                tooltip="Iqtibos"
                shortcut="⌘⇧B"
            >
                <Quote className="size-4" strokeWidth={2} />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1.5 h-5!" />

            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                tooltip="Bekor qilish"
                shortcut="⌘Z"
            >
                <Undo2 className="size-4" strokeWidth={2} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                tooltip="Qayta bajarish"
                shortcut="⌘⇧Z"
            >
                <Redo2 className="size-4" strokeWidth={2} />
            </ToolbarButton>
        </div>
    );
}

// ─── Autocomplete dropdown (shared by both editor instances) ──────────────────

interface AutocompleteDropdownProps {
    open: boolean;
    items: string[];
    activeIndex: number;
    onSelect: (item: string) => void;
    onMouseDown: (e: React.MouseEvent) => void;
}

function AutocompleteDropdown({
    open,
    items,
    activeIndex,
    onSelect,
    onMouseDown,
}: AutocompleteDropdownProps) {
    const activeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (open && activeRef.current) {
            activeRef.current.scrollIntoView({ block: "nearest" });
        }
    }, [open, activeIndex]);

    if (!open || items.length === 0) return null;

    return (
        <div
            onMouseDown={onMouseDown}
            style={{
                position: "absolute",
                bottom: "100%",
                left: 0,
                right: 0,
                zIndex: 50,
                marginBottom: "2px",
                backgroundColor: "var(--popover)",
                color: "var(--popover-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                maxHeight: "180px",
                overflowY: "auto",
                padding: "4px",
            }}
        >
            {items.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                    <button
                        key={item}
                        ref={isActive ? activeRef : undefined}
                        type="button"
                        onClick={() => onSelect(item)}
                        style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "5px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontFamily: "var(--font-mono, monospace)",
                            cursor: "pointer",
                            border: "none",
                            backgroundColor: isActive
                                ? "color-mix(in srgb, var(--primary) 15%, transparent)"
                                : "transparent",
                            color: isActive ? "var(--primary)" : "var(--popover-foreground)",
                        }}
                    >
                        {`{{${item}}}`}
                    </button>
                );
            })}
        </div>
    );
}

// ─── useEditorAutocomplete hook ───────────────────────────────────────────────

interface AutocompleteState {
    open: boolean;
    query: string;
    filtered: string[];
    activeIndex: number;
}

function getQueryFromEditor(editor: Editor): string | null {
    const { state } = editor;
    const { from } = state.selection;
    // Get all text from start of document to cursor position
    const textBefore = state.doc.textBetween(0, from, "\n", "\0");
    const lastOpen = textBefore.lastIndexOf("{{");
    if (lastOpen === -1) return null;
    const afterOpen = textBefore.slice(lastOpen + 2);
    // Already closed?
    if (afterOpen.includes("}}")) return null;
    return afterOpen;
}

function useEditorAutocomplete(suggestions: string[]) {
    const [state, setState] = useState<AutocompleteState>({
        open: false,
        query: "",
        filtered: [],
        activeIndex: 0,
    });

    const checkTrigger = useCallback(
        (editor: Editor) => {
            const query = getQueryFromEditor(editor);
            if (query === null) {
                setState((prev) => (prev.open ? { ...prev, open: false } : prev));
                return;
            }
            const q = query.toLowerCase();
            const filtered = suggestions.filter(
                (s) => q === "" || s.toLowerCase().includes(q),
            );
            setState({
                open: filtered.length > 0,
                query,
                filtered,
                activeIndex: 0,
            });
        },
        [suggestions],
    );

    const close = useCallback(() => {
        setState((prev) => ({ ...prev, open: false }));
    }, []);

    const selectSuggestion = useCallback(
        (editor: Editor, suggestion: string) => {
            const { state: editorState } = editor;
            const { from } = editorState.selection;
            const textBefore = editorState.doc.textBetween(0, from, "\n", "\0");
            const lastOpen = textBefore.lastIndexOf("{{");
            if (lastOpen === -1) return;

            // Delete from lastOpen position to cursor, then insert {{suggestion}}
            // lastOpen is a character offset in the text; need to find ProseMirror pos.
            // We'll use deleteRange + insertContent approach.
            const deleteFrom = from - (textBefore.length - lastOpen);
            const deleteTo = from;

            editor
                .chain()
                .focus()
                .deleteRange({ from: deleteFrom, to: deleteTo })
                .insertContent(`{{${suggestion}}}`)
                .run();

            close();
        },
        [close],
    );

    const handleKeyDown = useCallback(
        (editor: Editor, e: KeyboardEvent): boolean => {
            if (!state.open) return false;
            if (e.key === "Escape") {
                close();
                return true;
            }
            if (e.key === "ArrowDown") {
                setState((prev) => ({
                    ...prev,
                    activeIndex:
                        (prev.activeIndex + 1) % Math.max(prev.filtered.length, 1),
                }));
                return true;
            }
            if (e.key === "ArrowUp") {
                setState((prev) => ({
                    ...prev,
                    activeIndex:
                        (prev.activeIndex - 1 + Math.max(prev.filtered.length, 1)) %
                        Math.max(prev.filtered.length, 1),
                }));
                return true;
            }
            if (e.key === "Enter" || e.key === "Tab") {
                if (state.filtered.length > 0) {
                    selectSuggestion(
                        editor,
                        state.filtered[state.activeIndex] ?? state.filtered[0],
                    );
                    return true;
                }
            }
            return false;
        },
        [state, close, selectSuggestion],
    );

    return { acState: state, checkTrigger, close, selectSuggestion, handleKeyDown };
}

// ─── InlineEditorContent ──────────────────────────────────────────────────────

function InlineEditorContent({
    defaultValue,
    onChange,
    suggestions = [],
}: {
    defaultValue: string;
    onChange?: (value: string) => void;
    suggestions?: string[];
}) {
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const { acState, checkTrigger, close, selectSuggestion, handleKeyDown } =
        useEditorAutocomplete(suggestions);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: false,
                horizontalRule: false,
                bulletList: false,
                orderedList: false,
                listItem: false,
            }),
            Underline,
            VariableHighlightExtension,
        ],
        content: defaultValue?.replace(/\n/g, "<br>") || "",
        onUpdate: ({ editor: ed }) => {
            let html_content = ed.getHTML();
            html_content = html_content.replace(/<\/p><p>/g, "\n");
            html_content = html_content.replace(/<\/?p>/g, "");
            onChangeRef.current?.(html_content);
            checkTrigger(ed);
        },
        onSelectionUpdate: ({ editor: ed }) => {
            checkTrigger(ed);
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-3 py-2 text-sm leading-relaxed",
            },
            handleKeyDown: (view, event) => {
                // Build a temporary editor-like object to pass to handleKeyDown.
                // We need the actual editor instance; store it via ref.
                return false; // handled in onKeyDown via editorRef
            },
        },
    });

    // Store editor in ref for the keydown handler
    const editorRef = useRef<Editor | null>(null);
    editorRef.current = editor;

    // Override editorProps.handleKeyDown after editor is created
    useEffect(() => {
        if (!editor) return;
        const originalHandleKeyDown = editor.options.editorProps.handleKeyDown;
        editor.setOptions({
            editorProps: {
                ...editor.options.editorProps,
                handleKeyDown: (_view, event) => {
                    if (originalHandleKeyDown?.(_view, event)) return true;
                    return handleKeyDown(editor, event);
                },
            },
        });
    }, [editor, handleKeyDown]);

    return (
        <div
            className="tg-editor rounded-lg border border-border/60 overflow-hidden shadow-sm"
            style={{ backgroundColor: "#171717", position: "relative" }}
        >
            <div className="border-b border-border/40 bg-muted/20">
                <EditorToolbar editor={editor} />
            </div>
            <div className="relative">
                <EditorContent editor={editor} />
                <div className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/60 font-mono tabular-nums">
                    {editor?.getText().length ?? 0} belgi
                </div>
            </div>
            <AutocompleteDropdown
                open={acState.open}
                items={acState.filtered}
                activeIndex={acState.activeIndex}
                onSelect={(item) => {
                    if (editor) selectSuggestion(editor, item);
                }}
                onMouseDown={(e) => e.preventDefault()}
            />
        </div>
    );
}

// ─── LazyEditorContent ────────────────────────────────────────────────────────

function LazyEditorContent({
    defaultValue,
    onChange,
    onClose,
    suggestions = [],
}: {
    defaultValue: string;
    onChange?: (value: string) => void;
    onClose: () => void;
    suggestions?: string[];
}) {
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const { acState, checkTrigger, close, selectSuggestion, handleKeyDown } =
        useEditorAutocomplete(suggestions);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: false,
                horizontalRule: false,
                bulletList: false,
                orderedList: false,
                listItem: false,
            }),
            Underline,
            VariableHighlightExtension,
        ],
        content: defaultValue?.replace(/\n/g, "<br>") || "",
        onCreate: ({ editor: _ed }) => {
        },
        onUpdate: ({ editor: ed }) => {
            let html_content = ed.getHTML();
            html_content = html_content.replace(/<\/p><p>/g, "\n");
            html_content = html_content.replace(/<\/?p>/g, "");
            onChangeRef.current?.(html_content);
            checkTrigger(ed);
        },
        onSelectionUpdate: ({ editor: ed }) => {
            checkTrigger(ed);
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[160px] px-4 py-3 text-sm leading-relaxed",
            },
        },
    });

    useEffect(() => {
        if (!editor) return;
        const originalHandleKeyDown = editor.options.editorProps.handleKeyDown;
        editor.setOptions({
            editorProps: {
                ...editor.options.editorProps,
                handleKeyDown: (_view, event) => {
                    if (originalHandleKeyDown?.(_view, event)) return true;
                    return handleKeyDown(editor, event);
                },
            },
        });
    }, [editor, handleKeyDown]);

    const charCount = editor?.getText().length ?? 0;

    return (
        <>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <DialogHeader className="gap-1">
                    <DialogTitle className="text-base font-semibold tracking-tight">
                        Matn muharriri
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Telegram uchun formatlangan xabar yozing
                    </DialogDescription>
                </DialogHeader>
                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                >
                    <X className="size-4" strokeWidth={2} />
                </button>
            </div>

            <div
                className="tg-editor mx-4 mb-4 rounded-lg border border-border/60 overflow-hidden shadow-sm"
                style={{ backgroundColor: "#171717", position: "relative" }}
            >
                <div className="border-b border-border/40 bg-muted/20">
                    <EditorToolbar editor={editor} />
                </div>

                <div className="relative">
                    <EditorContent editor={editor} />
                    <div className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/60 font-mono tabular-nums">
                        {charCount} belgi
                    </div>
                </div>

                <AutocompleteDropdown
                    open={acState.open}
                    items={acState.filtered}
                    activeIndex={acState.activeIndex}
                    onSelect={(item) => {
                        if (editor) selectSuggestion(editor, item);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                />
            </div>

            <div className="flex items-center justify-end gap-2 px-5 pb-5">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="rounded-lg text-muted-foreground"
                >
                    Bekor qilish
                </Button>
                <Button
                    size="sm"
                    onClick={onClose}
                    className="rounded-lg px-5"
                >
                    Saqlash
                </Button>
            </div>
        </>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function TelegramRichTextEditor({
    defaultValue,
    onChange,
    suggestions,
}: {
    defaultValue?: string;
    onChange?: (value: string) => void;
    suggestions?: string[];
}) {
    const inPanel = useIsInNodePanel();

    // Sidebar'da inline editor ko'rsatish
    if (inPanel) {
        return (
            <InlineEditorContent
                defaultValue={defaultValue || ""}
                onChange={onChange}
                suggestions={suggestions}
            />
        );
    }

    // Canvas'da faqat matnni ko'rsatish (node bosish → sidebar ochiladi)
    return (
        <div
            className="text-editor-content bg-muted/20 p-2.5 rounded border border-border/40 min-h-[36px] text-sm text-foreground/80 leading-relaxed"
            dangerouslySetInnerHTML={{
                __html: defaultValue?.trim()
                    ? defaultValue.replace(/\n/g, "<br>")
                    : '<span class="italic text-muted-foreground/50 text-xs">Matn yozilmagan...</span>',
            }}
        />
    );
}
