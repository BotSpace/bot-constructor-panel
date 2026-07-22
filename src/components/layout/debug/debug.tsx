"use client";

import React from "react";
import { BotMessageSquare, Copy, Mail, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";

import useProjectStore from "@/features/bot-constructor/store/project";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BottomButtonGroup from "@/features/bot-constructor/panels/bottom-panel/components/button-group";
import { BottomPanelButton } from "@/features/bot-constructor/panels/bottom-panel/components/button";

// Debug runtime is lifecycle-managed by the backend: project creation starts
// it and every saved edit hot-reloads it. The toolbar therefore only exposes
// the useful bot link; manual Run/Reload/Stop controls would compete with the
// automatic desired state.
export default function DebugingButtons() {
  const { project } = useProjectStore();
  const botLink = project?.debug_uuid
    ? `https://telegram.me/botmother_test_robot?start=${project.debug_uuid}`
    : "";

  if (!project || !botLink) return null;

  function handleCopyLink() {
    void navigator.clipboard.writeText(botLink);
    toast.success("Link nusxalandi!");
  }

  function handleShareViaGmail() {
    const subject = encodeURIComponent("Debug Bot Link");
    const body = encodeURIComponent(`Debug bot link:\n${botLink}`);
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`,
      "_blank",
    );
  }

  function handleShareViaTelegram() {
    const text = encodeURIComponent(`Debug bot link: ${botLink}`);
    window.open(
      `https://telegram.me/share/url?url=${encodeURIComponent(botLink)}&text=${text}`,
      "_blank",
    );
  }

  return (
    <BottomButtonGroup>
      <BottomPanelButton size="default" asChild>
        <a href={botLink} target="_blank" rel="noopener noreferrer">
          <BotMessageSquare className="h-4 w-4" />
          Open bot
        </a>
      </BottomPanelButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <BottomPanelButton size="icon" title="Debug bot linkini ulashish">
            <Share2 className="h-4 w-4" />
          </BottomPanelButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareViaGmail}>
            <Mail className="mr-2 h-4 w-4" />
            Send via Gmail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareViaTelegram}>
            <BotMessageSquare className="mr-2 h-4 w-4" />
            Send via Telegram
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </BottomButtonGroup>
  );
}
