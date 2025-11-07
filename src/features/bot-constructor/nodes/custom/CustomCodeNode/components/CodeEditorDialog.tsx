import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@radix-ui/react-dialog";
import { CodeExecutionContext } from "../types";
import AiogramEditor from "@/features/bot-constructor/editor";
import EditorSettings from "@/features/bot-constructor/editor/settings";

interface CodeEditorDialogProps {
  initialCode: string;
  onSave: (newCode: string) => void;
  children: React.ReactNode;
  contextType: CodeExecutionContext;
}

export const CodeEditorDialog = ({
  initialCode,
  onSave,
  children,
  contextType,
}: CodeEditorDialogProps) => {
  const [code, setCode] = useState(initialCode);
  const [isOpen, setIsOpen] = useState(false);

  // Bu ref "Bekor qilish" tugmasi bosilganini aniqlash uchun kerak
  const isCancelledRef = useRef(false);

  useEffect(() => {
    // Dialog ochilganda boshlang'ich qiymatlarni o'rnatamiz
    if (isOpen) {
      setCode(initialCode);
      isCancelledRef.current = false; // Holatni tozalaymiz
    }
  }, [isOpen, initialCode]);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isCancelledRef.current) {
      // Agar oyna yopilayotgan bo'lsa va "Bekor qilish" bosilmagan bo'lsa, saqlaymiz
      onSave(code);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[90%] w-full h-[90vh] flex flex-col">
        <VisuallyHidden>
          <DialogTitle>Edit code</DialogTitle>
        </VisuallyHidden>
        <div className="grid overflow-hidden flex-grow">
          <AiogramEditor
            contextType={contextType}
            initialCode={initialCode}
            onSave={onSave}
          />
        </div>
        <DialogFooter className="p-4 border-t bg-background/95 backdrop-blur-sm flex justify-between items-center">
          <EditorSettings />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
