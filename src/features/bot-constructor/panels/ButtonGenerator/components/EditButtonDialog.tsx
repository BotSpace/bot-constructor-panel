import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonConfig } from "@/features/bot-constructor/panels/ButtonGenerator/types";
import { cn } from "@/lib/utils";

interface EditButtonDialogProps {
  button: ButtonConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedButton: Partial<ButtonConfig>) => void;
}

export const EditButtonDialog = ({
  button,
  isOpen,
  onClose,
  onSave,
}: EditButtonDialogProps) => {
  const [text, setText] = useState("");
  const [value, setValue] = useState("");
  const [webAppUrl, setWebAppUrl] = useState("");

  useEffect(() => {
    if (button) {
      setText(button.text || "");
      if (button.type === "web_app") {
        setWebAppUrl(button.webApp?.url || button.value || "");
        setValue("");
      } else {
        setValue(button.value || "");
        setWebAppUrl("");
      }
    }
  }, [button]);

  const handleSave = () => {
    if (button?.type === "web_app") {
      if (!webAppUrl.startsWith("https://")) return;
      onSave({ text, webApp: { url: webAppUrl }, value: webAppUrl });
    } else {
      onSave({ text, value });
    }
    onClose();
  };

  if (!button) return null;

  const isWebApp = button.type === "web_app";
  const isUrlInvalid = isWebApp && webAppUrl.length > 0 && !webAppUrl.startsWith("https://");

  const getValueLabel = () => {
    switch (button.type) {
      case "url": return "URL";
      case "web_app": return "Web App URL";
      default: return "Callback data";
    }
  };

  const getValuePlaceholder = () => {
    switch (button.type) {
      case "url": return "https://example.com";
      case "web_app": return "https://app.example.com";
      default: return "callback_data";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tugmani tahrirlash</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-text">Tugma matni</Label>
            <Input
              id="edit-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tugma matni..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-value">{getValueLabel()}</Label>
            {isWebApp ? (
              <>
                <Input
                  id="edit-value"
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  placeholder={getValuePlaceholder()}
                  className={cn(
                    isUrlInvalid && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {isUrlInvalid && (
                  <p className="text-[11px] text-destructive">
                    URL https:// bilan boshlanishi shart
                  </p>
                )}
              </>
            ) : (
              <Input
                id="edit-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={getValuePlaceholder()}
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleSave}
            disabled={isWebApp && (!webAppUrl || !webAppUrl.startsWith("https://"))}
          >
            Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
