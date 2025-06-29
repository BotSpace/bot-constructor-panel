import { AppButton, TelegramKeyboardButton } from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";

interface CodeDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  keyboard: AppButton[][];
}

export function CodeDialog({ isOpen, setIsOpen, keyboard }: CodeDialogProps) {
  const generatedJson = useMemo(() => {
    // Ilovadagi 'id' maydonini olib tashlab, toza Telegram API formatini yaratamiz
    const cleanKeyboard: TelegramKeyboardButton[][] = keyboard
      .map((row) => row.map(({ id, ...rest }) => rest))
      .filter((row) => row.length > 0);

    const replyMarkup = {
      keyboard: cleanKeyboard,
      resize_keyboard: true,
      one_time_keyboard: false, // Buni ham sozlash mumkin
    };

    return JSON.stringify(replyMarkup, null, 2); // 2 - chiroyli formatlash uchun
  }, [keyboard]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedJson);
    toast.success("Kod nusxalandi!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tayyor JSON kod</DialogTitle>
          <DialogDescription>
            Ushbu kodni botingizda `reply_markup` parametri sifatida ishlating.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto text-sm">
            <code>{generatedJson}</code>
          </pre>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
