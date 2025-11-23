"use client";

import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import type { OutputData } from "@editorjs/editorjs";

import VariableTool from "./tools/VariableTool";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SendTextMessageNodeData } from "@/features/bot-constructor/nodes/actions/TextMessageNode/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TelegramEditorProps {
  initialData?: OutputData;
  onSave: (data: OutputData) => void;
  data: SendTextMessageNodeData;
}

function TelegramEditor({ initialData, onSave, data }: TelegramEditorProps) {
  const editorRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null); // Ref for the container div

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentVarNode, setCurrentVarNode] = useState<HTMLElement | null>(
    null
  );
  const [selectedMessageName, setSelectedMessageName] = useState<string>("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleEditorChangeRef = useRef<(() => void) | null>(null);
  const onSaveRef = useRef(onSave);

  // State setter funksiyalarini ref'da saqlash (event listener'lar uchun)
  const setIsDialogOpenRef = useRef(setIsDialogOpen);
  const setCurrentVarNodeRef = useRef(setCurrentVarNode);
  const setSelectedMessageNameRef = useRef(setSelectedMessageName);

  // Ref'larni yangilash
  useEffect(() => {
    setIsDialogOpenRef.current = setIsDialogOpen;
    setCurrentVarNodeRef.current = setCurrentVarNode;
    setSelectedMessageNameRef.current = setSelectedMessageName;
  }, [setIsDialogOpen, setCurrentVarNode, setSelectedMessageName]);

  // onSave'ni ref'da saqlash (har safar yangi reference bo'lishi mumkin)
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Dynamic messages list'ni memoize qilish
  const dynamicMessagesList = useMemo(() => {
    return data.dynamicMessages || [];
  }, [data.dynamicMessages]);

  useEffect(() => {
    // Faqat client-side'da EditorJS'ni yuklash
    if (typeof window === "undefined") return;

    let isMounted = true;

    const initEditor = async () => {
      try {
        // Dynamic import - faqat client-side'da
        const [
          { default: EditorJS },
          { default: Header },
          { default: List },
          { default: Paragraph },
          { default: CodeTool },
          { default: InlineCode },
          { default: Underline },
        ] = await Promise.all([
          import("@editorjs/editorjs"),
          import("@editorjs/header"),
          import("@editorjs/list"),
          import("@editorjs/paragraph"),
          import("@editorjs/code"),
          import("@editorjs/inline-code"),
          import("@editorjs/underline"),
        ]);

        if (!isMounted || !editorContainerRef.current || editorRef.current) {
          return;
        }

        const editor = new EditorJS({
          holder: editorContainerRef.current,
          data: initialData,
          placeholder: "Telegram post yozing...",
          inlineToolbar: true,
          tools: {
            header: Header,
            paragraph: {
              // @ts-ignore
              class: Paragraph,
              inlineToolbar: true,
            },
            list: List,
            code: CodeTool,
            inlineCode: InlineCode,
            underline: Underline,
            variable: {
              class: VariableTool as any,
            },
          },
        });

        if (isMounted) {
          editorRef.current = editor;
          setIsEditorReady(true);

          // Editor o'zgarishlarini kuzatish
          const handleEditorChange = () => {
            // Oldingi timeout'ni to'xtatish
            if (saveTimeoutRef.current) {
              clearTimeout(saveTimeoutRef.current);
            }

            // Debounce bilan save qilish (500ms kechikish)
            saveTimeoutRef.current = setTimeout(async () => {
              try {
                if (editorRef.current) {
                  const data = await editorRef.current.save();
                  onSaveRef.current(data);
                }
              } catch (error) {
                console.error("Failed to save editor data:", error);
              }
            }, 500);
          };

          // Funksiyani ref'da saqlash (cleanup uchun)
          handleEditorChangeRef.current = handleEditorChange;

          // Editor container'ga event listener'lar qo'shish
          const container = editorContainerRef.current;
          if (container) {
            // Input event'larni kuzatish
            container.addEventListener("input", handleEditorChange);
            container.addEventListener("keyup", handleEditorChange);
            container.addEventListener("paste", handleEditorChange);
            container.addEventListener("cut", handleEditorChange);

            // Click event'ni qo'shish - mavjud bloklarga bosilganda focus qaytarish
            const handleClick = (e: MouseEvent) => {
              // Agar click editor container ichida bo'lsa va editor tayyor bo'lsa
              if (editorRef.current && isMounted) {
                try {
                  // Click qilingan elementni topish
                  const target = e.target as HTMLElement;

                  // Agar click variable chip'ga bo'lsa, modal ochish
                  const variableChip = target.closest(
                    ".tg-variable-chip"
                  ) as HTMLElement;
                  if (variableChip) {
                    // Variable chip'ga click qilganda modal ochish
                    setCurrentVarNodeRef.current(variableChip);
                    const label = variableChip.getAttribute("data-label");
                    if (label && label !== "Select message") {
                      // Agar label bor bo'lsa, uni selectedMessageName'ga o'rnatish
                      setSelectedMessageNameRef.current(label);
                    } else {
                      setSelectedMessageNameRef.current("");
                    }
                    setIsDialogOpenRef.current(true);
                    return; // Variable chip'ga click qilganda focus qilmaslik
                  }

                  // EditorJS block elementini topish (ce-block class'iga ega)
                  const blockElement = target.closest(".ce-block");

                  if (blockElement) {
                    // Block ichidagi contentEditable elementni topish
                    const contentEditable = blockElement.querySelector(
                      '[contenteditable="true"]'
                    ) as HTMLElement;

                    if (contentEditable) {
                      // Kichik kechikish - EditorJS DOM'ni yangilash uchun
                      setTimeout(() => {
                        // ContentEditable elementni focus qilish
                        contentEditable.focus();

                        // Cursor'ni click joyiga qo'yish
                        const selection = window.getSelection();
                        if (selection) {
                          try {
                            // document.caretRangeFromPoint yoki document.caretPositionFromPoint ishlatish
                            let range: Range | null = null;

                            if (document.caretRangeFromPoint) {
                              range = document.caretRangeFromPoint(
                                e.clientX,
                                e.clientY
                              );
                            } else if (
                              (document as any).caretPositionFromPoint
                            ) {
                              const caretPos = (
                                document as any
                              ).caretPositionFromPoint(e.clientX, e.clientY);
                              if (caretPos) {
                                range = document.createRange();
                                range.setStart(
                                  caretPos.offsetNode,
                                  caretPos.offset
                                );
                                range.setEnd(
                                  caretPos.offsetNode,
                                  caretPos.offset
                                );
                              }
                            }

                            // Agar range topilmasa, contentEditable'ning oxiriga qo'yish
                            if (
                              !range ||
                              !contentEditable.contains(
                                range.commonAncestorContainer
                              )
                            ) {
                              const textNode = Array.from(
                                contentEditable.childNodes
                              ).find(
                                (node) => node.nodeType === Node.TEXT_NODE
                              ) as Text | undefined;

                              if (textNode) {
                                const textLength =
                                  textNode.textContent?.length || 0;
                                range = document.createRange();
                                range.setStart(textNode, textLength);
                                range.setEnd(textNode, textLength);
                              } else {
                                // Agar text node bo'lmasa, contentEditable'ning o'ziga range yaratish
                                range = document.createRange();
                                range.selectNodeContents(contentEditable);
                                range.collapse(false); // Oxiriga
                              }
                            }

                            if (range) {
                              selection.removeAllRanges();
                              selection.addRange(range);
                            }
                          } catch (err) {
                            // Xato bo'lsa, oddiy focus qilish
                            console.debug(
                              "Cursor positioning error (non-critical):",
                              err
                            );
                          }
                        }
                      }, 10);
                    }
                  }
                } catch (error) {
                  // Xato bo'lsa ham davom etish
                  console.debug("Focus error (non-critical):", error);
                }
              }
            };

            container.addEventListener("click", handleClick);

            // Cleanup uchun handler'ni saqlash
            (container as any)._handleClick = handleClick;
          }
        }
      } catch (error) {
        console.error("Failed to initialize EditorJS:", error);
      }
    };

    initEditor();

    return () => {
      isMounted = false;

      // Timeout'ni tozalash
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Event listener'larni olib tashlash
      const container = editorContainerRef.current;
      const handleEditorChange = handleEditorChangeRef.current;
      if (container && handleEditorChange) {
        container.removeEventListener("input", handleEditorChange);
        container.removeEventListener("keyup", handleEditorChange);
        container.removeEventListener("paste", handleEditorChange);
        container.removeEventListener("cut", handleEditorChange);

        // Click handler'ni olib tashlash
        const handleClick = (container as any)?._handleClick;
        if (handleClick) {
          container.removeEventListener("click", handleClick);
          delete (container as any)._handleClick;
        }
      }

      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // Faqat initialData o'zgarganda editor'ni qayta yaratish
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- AVTO-REPLACE LOGIKASI ---
  // Bu funksiya har bir tugma bosilganda ishlaydi
  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    // Faqat oddiy harflar yoki belgilar kiritilganda ishlaymiz
    if (e.key === "Control" || e.key === "Alt" || e.key === "Shift") return;

    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) return;

    const node = selection.anchorNode;
    const text = node.textContent || "";
    const offset = selection.anchorOffset;

    // Trigger so'zi: $msg
    const trigger = "$msg";
    const triggerLen = trigger.length;

    // Agar kursor oldidagi so'z "$msg" bo'lsa
    if (offset >= triggerLen) {
      const textBeforeCaret = text.slice(offset - triggerLen, offset);

      if (textBeforeCaret === trigger) {
        // 1. Range yaratamiz ($msg so'zini belgilash uchun)
        const range = document.createRange();
        range.setStart(node, offset - triggerLen);
        range.setEnd(node, offset);

        // 2. Belgilangan $msg ni o'chiramiz
        range.deleteContents();

        // 3. Yangi Chip elementini yaratamiz
        // Biz VariableTool classidan foydalanishimiz yoki qo'lda yasashimiz mumkin.
        // Qo'lda yasash tezroq va osonroq:
        const chip = document.createElement("span");
        chip.className = "tg-variable-chip";
        // Default qiymat sifatida "Select message" yozamiz
        chip.setAttribute("data-label", "Select message");
        chip.contentEditable = "false"; // User ichini buza olmasligi uchun
        chip.innerText = "$msg";

        // 4. Chipni joylaymiz
        range.insertNode(chip);

        // 5. Kursorni Chipdan keyingi joyga qo'yamiz (Bo'sh joy qo'shib)
        const space = document.createTextNode("\u00A0"); // Non-breaking space
        range.insertNode(space); // Chipdan keyin space qo'shamiz

        // Kursorni space dan keying joylashtirish
        range.setStartAfter(space);
        range.setEndAfter(space);

        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, []);

  // --- DIALOG SAVE ---
  const saveVariableChange = useCallback(async () => {
    if (currentVarNode) {
      // Tanlangan dynamic message'ni topish
      const selectedMessage = dynamicMessagesList.find(
        (message) => message.name === selectedMessageName
      );

      if (selectedMessage) {
        const selectedName = selectedMessage.name;
        currentVarNode.innerText = `$${selectedName}`;
      } else {
        // Agar message topilmasa, default qiymat
        const selectedName = "Select message";
        currentVarNode.innerText = `$${selectedName}`;
        currentVarNode.setAttribute("data-label", selectedName);
      }

      // O'zgarishdan keyin editor'ni saqlash
      if (editorRef.current) {
        try {
          const data = await editorRef.current.save();
          onSaveRef.current(data);
        } catch (error) {
          console.error("Failed to save editor data:", error);
        }
      }
    }
    setIsDialogOpen(false);
  }, [selectedMessageName, dynamicMessagesList]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div
        ref={editorContainerRef}
        className="w-full p-2 cursor-text min-h-[100px]"
        onKeyUp={handleKeyUp} // Kuzatuvchi shu yerda
        tabIndex={0}
      />

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>O'zgaruvchi qiymati</AlertDialogTitle>
            <AlertDialogDescription>
              Dynamic message qiymatini kiriting:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select
              value={selectedMessageName || undefined}
              onValueChange={(value) => setSelectedMessageName(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select message" />
              </SelectTrigger>
              <SelectContent>
                {dynamicMessagesList.map((message) => (
                  <SelectItem key={message.name} value={message.name}>
                    {message.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={saveVariableChange}>
              Saqlash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Component'ni memoize qilish - faqat props o'zgarganda re-render
export default memo(TelegramEditor, (prevProps, nextProps) => {
  // Faqat muhim prop'lar o'zgarganda re-render qilish
  return (
    prevProps.initialData === nextProps.initialData &&
    prevProps.onSave === nextProps.onSave &&
    prevProps.data.dynamicMessages === nextProps.data.dynamicMessages
  );
});
