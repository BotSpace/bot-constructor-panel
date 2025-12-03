import { useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Send, UserPlus, X, AlertCircle } from "lucide-react";

/**
 * Komponent qabul qiladigan props'lar uchun interfeys.
 */
interface RecipientsManagerProps {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };
  onUpdate: (update: {
    recipients: RecipientsManagerProps["recipients"];
  }) => void;
}

/**
 * Oluvchilarni to'liq boshqarish uchun mo'ljallangan komponent.
 * Yuboruvchini o'chirish/qo'shish va qo'shimcha ID'lar bilan ishlash imkonini beradi.
 */
export const RecipientsManager = ({
  recipients,
  onUpdate,
}: RecipientsManagerProps) => {
  // Standart qiymatlarni belgilaymiz
  const sendToSender = recipients?.sendToSender ?? true; // Agar belgilanmagan bo'lsa, 'true'
  const additionalIds = recipients?.additionalIds || [];

  const [inputValue, setInputValue] = useState("");
  const [isInputVisible, setIsInputVisible] = useState(false);

  /**
   * Komponent holatini yangilash uchun markaziy funksiya
   */
  const updateRecipients = (
    newRecipients: RecipientsManagerProps["recipients"]
  ) => {
    onUpdate({ recipients: newRecipients });
  };

  /**
   * "Yuboruvchiga" holatini o'zgartiradi.
   */
  const toggleSendToSender = () => {
    updateRecipients({
      sendToSender: !sendToSender,
      additionalIds: additionalIds,
    });
  };

  const handleAddRecipient = () => {
    const newId = inputValue.trim();
    if (newId === "" || additionalIds.includes(newId)) {
      setInputValue("");
      setIsInputVisible(false);
      return;
    }
    updateRecipients({
      sendToSender: sendToSender,
      additionalIds: [...additionalIds, newId],
    });
    setInputValue("");
    setIsInputVisible(false);
  };

  const handleRemoveRecipient = (idToRemove: string) => {
    updateRecipients({
      sendToSender: sendToSender,
      additionalIds: additionalIds.filter((id) => id !== idToRemove),
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddRecipient();
    } else if (event.key === "Escape") {
      setIsInputVisible(false);
      setInputValue("");
    }
  };

  const noRecipientsSelected = !sendToSender && additionalIds.length === 0;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label>Qabul qiluvchilar</Label>
        {noRecipientsSelected && (
          <div
            className="flex items-center text-xs text-destructive"
            title="Hech bo'lmaganda bitta qabul qiluvchi tanlanishi kerak"
          >
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Tanlanmagan
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border p-2 min-h-[40px]">
        {/* === "YUBORUVCHIGA" TOGGLE TUGMASI === */}
        <button
          type="button"
          onClick={toggleSendToSender}
          title={
            sendToSender
              ? "Yuboruvchiga yuborishni bekor qilish"
              : "Yuboruvchiga ham yuborish"
          }
          className={cn(
            "flex items-center gap-1.5 pl-2 pr-3 py-1 text-sm rounded-md transition-colors border",
            sendToSender
              ? "bg-secondary text-secondary-foreground"
              : "bg-transparent text-muted-foreground hover:bg-muted/50 border-dashed"
          )}
        >
          <Send className={cn("h-3.5 w-3.5", !sendToSender && "opacity-50")} />
          Yuboruvchiga
        </button>

        {/* Qo'shilgan ID'lar ro'yxati (chiplar) */}
        {additionalIds.map((id) => (
          <Badge
            key={id}
            variant="outline"
            className="gap-1 pl-2.5 pr-1.5 py-1 text-sm font-mono"
          >
            {id}
            <button
              onClick={() => handleRemoveRecipient(id)}
              className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
              title={`O'chirish: ${id}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Yangi ID kiritish Input'i */}
        {isInputVisible && (
          <Input
            autoFocus
            type="text"
            placeholder="User/Chat ID"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAddRecipient}
            className="h-7 w-32 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-1"
          />
        )}

        {/* "Qo'shish" tugmasi */}
        {!isInputVisible && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsInputVisible(true)}
            title="Qo'shimcha qabul qiluvchi qo'shish"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
