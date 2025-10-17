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
import { instanceAuth } from "@/services/instance";
import { useState } from "react";
import toast from "react-hot-toast";

export function SetEnvDialog({
  dialog_title,
  dialog_description,
  env_name,
  project_id,
  children,
  onSuccess,
}: {
  dialog_title: string;
  dialog_description: string;
  env_name: string;
  project_id: number | string;
  children: React.ReactNode;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");

  const handleSetEnv = async () => {
    try {
      await instanceAuth.post("/enviroment/", {
        key: env_name,
        value: token,
        project: project_id,
      });
      toast.success("Bot muvaffaqiyatli qo'shildi!");
      onSuccess?.();
      setOpen(false);
    } catch {
      toast.error("Bot qo'shishda xatolik yuz berdi.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialog_title}</DialogTitle>
          <DialogDescription>{dialog_description}</DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Bot tokenini kiriting"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <Button onClick={handleSetEnv}>Add Bot</Button>
      </DialogContent>
    </Dialog>
  );
}
