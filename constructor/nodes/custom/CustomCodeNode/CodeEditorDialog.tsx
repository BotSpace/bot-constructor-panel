import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Save,
  HelpCircle,
  Bot,
  MessageSquare,
  Braces,
} from "lucide-react";
import { CodeExecutionContext } from "./types";
import EditorController from "@/constructor/components/editor/editor";

interface CodeEditorDialogProps {
  initialCode: string;
  onSave: (newCode: string) => void;
  children: React.ReactNode;
  contextType: CodeExecutionContext;
}

const ContextInfoPanel = () => (
  <div className="h-full w-64 bg-background/50 p-4 border-l overflow-y-auto">
    <div className="space-y-4">
      <div>
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" /> `bot` obyekti
        </h4>
        <p className="text-xs text-muted-foreground font-mono">
          bot.send_message(...)
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          bot.send_photo(...)
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          ... va boshqalar
        </p>
      </div>
      <div>
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-green-400" /> Triggerlar
        </h4>
        <p className="text-xs text-muted-foreground font-mono">
          message: Message
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          callback: CallbackQuery
        </p>
        <p className="text-xs text-muted-foreground font-mono">chat_id: int</p>
      </div>
      <div>
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <Braces className="h-4 w-4 text-amber-400" /> `context` lug'ati
        </h4>
        <p className="text-xs text-muted-foreground">
          Keyingi node'larga ma'lumot uzatish uchun ishlatiladi.
        </p>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          context['yangi_uzgaruvchi'] = 123
        </p>
      </div>
    </div>
  </div>
);

export const CodeEditorDialog = ({
  initialCode,
  onSave,
  children,
}: CodeEditorDialogProps) => {
  const [code, setCode] = useState(initialCode);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode(initialCode);
    }
  }, [isOpen, initialCode]);

  const handleSave = () => {
    onSave(code);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[90%] w-full h-[90vh] flex flex-col gap-0">
        <EditorController initialCode={code} onCodeChange={setCode} />
        <DialogFooter className="p-4 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>
              Snippet'lar uchun <strong>if</strong> yoki <strong>try</strong>{" "}
              yozib Tab'ni bosing.
            </span>
          </div>
          <div className="flex-grow" />
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Bekor qilish
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
