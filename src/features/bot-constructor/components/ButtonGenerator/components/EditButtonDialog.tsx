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
import { ButtonConfig } from "../types";

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

  useEffect(() => {
    if (button) {
      setText(button.text || "");
      setValue(button.value || "");
    }
  }, [button]);

  const handleSave = () => {
    onSave({ text, value });
    onClose();
  };

  if (!button) return null;

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
            <Label htmlFor="edit-value">
              {button.type === "url" ? "URL" : "Callback data"}
            </Label>
            <Input
              id="edit-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                button.type === "url"
                  ? "https://example.com"
                  : "callback_data"
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={handleSave}>Saqlash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
