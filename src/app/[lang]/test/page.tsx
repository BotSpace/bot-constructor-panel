"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useState } from "react";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Quote,
    Undo2,
    Redo2,
    FileText,
    X,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
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

const telegramEditorCSS = `
  .tg-editor .ProseMirror code {
    background: hsl(var(--primary) / 0.07);
    color: hsl(var(--primary));
    padding: 2px 6px;
    border-radius: 5px;
    font-size: 0.8em;
    font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
    font-weight: 500;
    letter-spacing: -0.01em;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }
  .tg-editor .ProseMirror code::before,
  .tg-editor .ProseMirror code::after {
    content: none !important;
  }

  .tg-editor .ProseMirror blockquote {
    position: relative;
    border-left: none;
    padding-left: 14px;
    margin: 6px 0;
    font-style: normal;
    background: #00b1ff38;
    border-radius: 5px;
    overflow: hidden;
  }
  .tg-editor .ProseMirror blockquote::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0px;
    bottom: 0px;
    width: 3px;
    background: #00b1ff;
    transition: background 0.15s ease;
  }
  .tg-editor .ProseMirror blockquote p {
    margin: 0;
    color: hsl(var(--muted-foreground));
  }

  .tg-editor .ProseMirror pre {
    background: hsl(var(--muted) / 0.6);
    border: 1px solid hsl(var(--border) / 0.5);
    border-radius: 8px;
    padding: 10px 14px;
    margin: 6px 0;
    overflow-x: auto;
  }
  .tg-editor .ProseMirror code {
    color: inherit;
    padding: 5px;
    border-radius: 5px;
    font-size: 0.82em;
    font-weight: 400;
    background: #8082845c;
    }
`;

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

function HtmlPreview({ html }: { html: string }) {
    if (!html) return null;
    return (
        <div className="relative group">
            <div className="px-3 py-2.5 border-t border-border/30">
                <pre className="text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                    {html}
                </pre>
            </div>
        </div>
    );
}

export default function TestPage() {
    const [open, setOpen] = useState(false);
    const [htmlOutput, setHtmlOutput] = useState("");

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
        content: "<p>Salom! <strong>Matnni</strong> tahrirlashni boshlang...</p>",
        onCreate: ({ editor }) => {
            setHtmlOutput(tiptapToTelegramHTML(editor.getHTML()));
        },
        onUpdate: ({ editor }) => {
            setHtmlOutput(tiptapToTelegramHTML(editor.getHTML()));
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[160px] px-4 py-3 text-sm leading-relaxed",
            },
        },
    });

    const charCount = editor?.getText().length ?? 0;

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Button
                onClick={() => setOpen(true)}
                variant="outline"
                className="gap-2 rounded-lg border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
                <FileText className="size-4" strokeWidth={2} />
                Matn tahrirlash
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    showCloseButton={false}
                    className="sm:max-w-[560px] p-0 gap-0 overflow-hidden rounded-xl border-border/50 shadow-2xl"
                >
                    {/* Header */}
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
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                        >
                            <X className="size-4" strokeWidth={2} />
                        </button>
                    </div>

                    {/* Editor area */}
                    <style dangerouslySetInnerHTML={{ __html: telegramEditorCSS }} />
                    <div className="tg-editor mx-4 mb-4 rounded-lg border border-border/60 bg-background overflow-hidden shadow-sm">
                        {/* Toolbar */}
                        <div className="border-b border-border/40 bg-muted/20">
                            <EditorToolbar editor={editor} />
                        </div>

                        {/* Content */}
                        <div className="relative">
                            <EditorContent editor={editor} />
                            <div className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/60 font-mono tabular-nums">
                                {charCount} belgi
                            </div>
                        </div>

                        {/* HTML preview */}
                        <HtmlPreview html={htmlOutput} />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 px-5 pb-5">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpen(false)}
                            className="rounded-lg text-muted-foreground"
                        >
                            Bekor qilish
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                console.log("HTML:", htmlOutput || editor?.getHTML());
                                setOpen(false);
                            }}
                            className="rounded-lg px-5"
                        >
                            Saqlash
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
