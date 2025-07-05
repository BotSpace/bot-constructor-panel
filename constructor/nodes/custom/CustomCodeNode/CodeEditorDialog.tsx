import { useState, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Save,
  Zap,
  HelpCircle,
  Bot,
  MessageSquare,
  Braces,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CodeExecutionContext } from "./types";
import { setupPythonEditor } from "./editor.setup"; // Modular config

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
  contextType,
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

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Python muharririni konfiguratsiya qilish
    const disposables = setupPythonEditor(monaco, contextType);

    // Ctrl/Cmd + S bosilganda saqlash
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, handleSave);
    editor.focus();

    // Editor yopilganda tozalash
    return () => {
      disposables.forEach((d) => d.dispose());
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[90%] w-full h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Zap className="text-yellow-400" />
            Maxsus Python Kodi
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="flex-grow flex h-full overflow-hidden">
          <div className="flex-1 h-full">
            <Editor
              height="100%"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                fontFamily: "Fira Code, monospace",
                wordWrap: "on",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 4,
                automaticLayout: true,
              }}
            />
          </div>
          <ContextInfoPanel />
        </div>
        <Separator />
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
