"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useCallback, useRef } from "react";
import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";
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

function InlineEditorContent({ defaultValue, onChange }: {
    defaultValue: string;
    onChange?: (value: string) => void;
}) {
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

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
        ],
        content: defaultValue?.replace(/\n/g, "<br>") || "",
        onUpdate: ({ editor }) => {
            let html_content = editor.getHTML();
            html_content = html_content.replace(/<\/p><p>/g, "\n");
            html_content = html_content.replace(/<\/?p>/g, "");
            onChangeRef.current?.(html_content);
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-3 py-2 text-sm leading-relaxed",
            },
        },
    });

    return (
        <div className="tg-editor rounded-lg border border-border/60 bg-background overflow-hidden shadow-sm">
            <div className="border-b border-border/40 bg-muted/20">
                <EditorToolbar editor={editor} />
            </div>
            <div className="relative">
                <EditorContent editor={editor} />
                <div className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/60 font-mono tabular-nums">
                    {editor?.getText().length ?? 0} belgi
                </div>
            </div>
        </div>
    );
}

function LazyEditorContent({ defaultValue, onChange, onClose }: {
    defaultValue: string;
    onChange?: (value: string) => void;
    onClose: () => void;
}) {
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

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
        ],
        content: defaultValue?.replace(/\n/g, "<br>") || "",
        onCreate: ({ editor }) => {
        },
        onUpdate: ({ editor }) => {
            let html_content = editor.getHTML();

            html_content = html_content.replace(/<\/p><p>/g, "\n");
            html_content = html_content.replace(/<\/?p>/g, "");

            console.log("🔍 ~ LazyEditorContent ~ src/features/bot-constructor/components/TelegramRichTextEditor/TelegramRichTextEditor.tsx:272 ~ html_content:", html_content);

            onChangeRef.current?.(html_content);
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[160px] px-4 py-3 text-sm leading-relaxed",
            },
        },
    });

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

            <div className="tg-editor mx-4 mb-4 rounded-lg border border-border/60 bg-background overflow-hidden shadow-sm">
                <div className="border-b border-border/40 bg-muted/20">
                    <EditorToolbar editor={editor} />
                </div>

                <div className="relative">
                    <EditorContent editor={editor} />
                    <div className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/60 font-mono tabular-nums">
                        {charCount} belgi
                    </div>
                </div>
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

export default function TelegramRichTextEditor({ defaultValue, onChange }: { defaultValue?: string, onChange?: (value: string) => void }) {
    const inPanel = useIsInNodePanel();

    // Sidebar'da inline editor ko'rsatish
    if (inPanel) {
        return (
            <InlineEditorContent
                defaultValue={defaultValue || ""}
                onChange={onChange}
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
