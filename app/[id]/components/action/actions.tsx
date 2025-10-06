"use client";

import React, { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";
import { BugPlay, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { useFlowStore } from "@/constructor/store";
import useUserStore from "@/services/store/project";
import { instanceAuth } from "@/services/instance";
import { getBotInfo } from "@/services/requests/bot";
import { BotInfo } from "@/types/http/bot";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ----------------------------- HEADER ACTIONS ----------------------------- */
export default function HeaderActions() {
  const { loading, response } = useUserStore((s) => s);
  const { loadFlow } = useFlowStore(
    (s) => ({ isDirty: s.isDirty, loadFlow: s.loadFlow, saveFlow: s.saveFlow }),
    shallow
  );

  useEffect(() => {
    if (response && !loading) loadFlow(String(response.data.flow));
  }, [response, loading, loadFlow]);

  // Prevent Ctrl+R (refresh)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r")
        e.preventDefault();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!response) return null;

  const project = response.data;

  return (
    <div className="flex items-center gap-3">
      {/* DEBUG BOT */}
      {project.bot_for_debug ? (
        <Button
          onClick={() => toast.info("Debug rejimi ishga tushdi")}
          variant="outline"
          size="sm"
        >
          <BugPlay className="mr-1 h-4 w-4" />
          DEBUG
        </Button>
      ) : (
        <AddBotDialog
          bot_for="debug"
          project_id={project.id}
          dialog_title="Debug Bot qo‘shish"
          dialog_description="Telegram debug bot tokenini kiriting"
          trigger={<Button size="sm">Add Debug Bot</Button>}
        />
      )}

      {/* RELEASE BOT */}
      {project.bot_for_release ? (
        <PublishDropdown />
      ) : (
        <AddBotDialog
          bot_for="release"
          project_id={project.id}
          dialog_title="Release Bot qo‘shish"
          dialog_description="Telegram release bot tokenini kiriting"
          trigger={<Button size="sm">Add Release Bot</Button>}
        />
      )}
    </div>
  );
}

/* ----------------------------- ADD BOT DIALOG ----------------------------- */
function AddBotDialog({
  dialog_title,
  dialog_description,
  bot_for,
  project_id,
  trigger,
}: {
  dialog_title: string;
  dialog_description: string;
  bot_for: "debug" | "release";
  project_id: number;
  trigger: React.ReactNode;
}) {
  const { setDebugBot, setRelaseBot } = useUserStore((s) => s);
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");

  async function handleAddBot() {
    try {
      const { data } = await getBotInfo<BotInfo>({ token });
      const botData = {
        name: data.result.first_name,
        token,
        username: data.result.username,
      };

      const res = await instanceAuth.post("/bot/", botData);
      const bot = res.data.data;

      const updateParams =
        bot_for === "debug"
          ? { bot_for_debug: bot.id }
          : { bot_for_release: bot.id };

      if (bot_for === "debug") setDebugBot(bot);
      else setRelaseBot(bot);

      await instanceAuth.patch(`/project/${project_id}/`, updateParams);
      toast.success("Bot muvaffaqiyatli qo‘shildi!");
    } catch (error) {
      toast.error("Bot qo‘shishda xatolik yuz berdi.");
    } finally {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialog_title}</DialogTitle>
          <DialogDescription>{dialog_description}</DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Bot tokenini kiriting"
          value={token}
          onChange={(e: any) => setToken(e.target.value)}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Bekor qilish
          </Button>
          <Button onClick={handleAddBot}>
            <PlusCircle className="mr-1 h-4 w-4" />
            Qo‘shish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- PUBLISH DROPDOWN ----------------------------- */
function PublishDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">Publish</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Invite Users</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Email</DropdownMenuItem>
              <DropdownMenuItem>Message</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Log out <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
