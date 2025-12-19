import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { instanceAuth } from "@/services/instance";
import { isTelegramTokenValid } from "@/lib/chech-bot-token";

// TODO faqt add uchun qilish kerak
export function AddEnvDialog({
  dialog_title,
  dialog_description,
  env_name,
  project_id,
  children,
  onSuccess,
  envId, // optional: if provided -> update mode
  initialValue, // optional: prefills token when editing
}: {
  dialog_title: string;
  dialog_description: string;
  env_name: string;
  project_id: number | string;
  children: React.ReactNode;
  onSuccess?: () => void;
  envId?: number | string;
  initialValue?: string;
}) {
  const isEdit = typeof envId !== "undefined";
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill when opening in edit mode
  useEffect(() => {
    if (open) {
      setToken(isEdit ? initialValue ?? "" : "");
    }
  }, [open, isEdit, initialValue]);

  const handleSubmit = async () => {
    const trimmed = token.trim();
    if (!trimmed) {
      toast.error("Iltimos tokenni kiriting.");
      return;
    }

    const isTokenValid = await isTelegramTokenValid(token);

    if (!isTokenValid) {
      toast.error("Noto'g'ri bot tokeni. Iltimos, qayta tekshiring.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        // update existing env
        await instanceAuth.patch(`/enviroment/${envId}/`, {
          value: trimmed,
        });
        toast.success("Bot token muvaffaqiyatli yangilandi!");
      } else {
        // create new env
        await instanceAuth.post("/enviroment/", {
          key: env_name,
          value: trimmed,
          project: project_id,
        });
        toast.success("Bot muvaffaqiyatli qo'shildi!");
      }
      onSuccess?.();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(
        isEdit
          ? "Yangilashda xatolik yuz berdi."
          : "Qo'shishda xatolik yuz berdi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialog_title}</DialogTitle>
          <DialogDescription>{dialog_description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="text-sm font-medium">Bot token</label>
          <Input
            placeholder="Bot tokenini kiriting"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            aria-label="Bot token"
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !token.trim()}>
            {loading
              ? isEdit
                ? "Yangilanmoqda..."
                : "Qo'shilmoqda..."
              : isEdit
                ? "Update Bot"
                : "Add Bot"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
