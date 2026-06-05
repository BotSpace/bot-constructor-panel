"use client";

import React, { useState } from "react";
import {
  BotMessageSquare,
  RotateCcw,
  StopCircle,
  Copy,
  Mail,
  Share2,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

import { instanceAuth } from "@/services/instance";

import useProjectStore from "@/features/bot-constructor/store/project";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BottomButtonGroup from "@/features/bot-constructor/components/bottom-panel/components/button-group";
import { BottomPanelButton } from "@/features/bot-constructor/components/bottom-panel/components/button";
import { PlayIcon } from "@/components/icons/play";
import CountdownComponent from "@/components/common/count-down/count-down";
import {
  RunningBotLimitModal,
  RunningBotLimitError,
} from "@/components/layout/components/running-bot-limit-modal";

/* ----------------------------- HEADER ACTIONS ----------------------------- */
export default function DebugingButtons() {
  const { id }: { id: string } = useParams();
  const { project, changeDebug } = useProjectStore();

  // Store'dan kerakli qismlarni olamiz
  const { saveFlow } = useFlowStore();

  const [limitError, setLimitError] = useState<RunningBotLimitError | null>(
    null
  );

  /* Ctrl+R is handled in constructor.tsx as a keyboard shortcut */

  /* --------------------------- Debug bot actions --------------------------- */
  function handleRunAndRelaodDebugBot() {
    saveFlow(id);

    // Capture original status before optimistic update so we can revert on error
    const prevStatus = project?.debug.status ?? "stopped";

    if (project)
      changeDebug({
        ...project["debug"],
        status: "initializing",
      });

    instanceAuth
      .get(`/project/${id}/debug/`)
      .then(() => {
        toast.success("Bot ishga tushirilmoqda...");
      })
      .catch((err) => {
        const raw = err?.response?.data;
        const data = raw?.data ?? raw;
        // Revert optimistic status update in all error cases
        if (project)
          changeDebug({ ...project["debug"], status: prevStatus });

        if (
          err?.response?.status === 409 &&
          data?.code === "running_bot_limit"
        ) {
          setLimitError(data as RunningBotLimitError);
        } else {
          toast.error("Botni ishga tushirishda xatolik yuz berdi.");
        }
      });
  }

  function handleStopBot() {
    if (project)
      changeDebug({
        ...project["debug"],
        status: "stopped",
      });

    instanceAuth
      .get(`/project/${id}/stop/`)
      .then(() => {
        toast.success("Bot muvaffaqiyatli to'xtatildi!");
      })
      .catch(() => {
        toast.error("Botni to'xtatishda xatolik yuz berdi.");
      });
  }

  /* --------------------------- Share bot link actions --------------------------- */
  const botLink = project?.debug_uuid
    ? `https://t.me/botmother_test_robot?start=${project.debug_uuid}`
    : "";

  function handleCopyLink() {
    if (!botLink) {
      toast.error("Bot linki mavjud emas.");
      return;
    }

    navigator.clipboard.writeText(botLink);
    toast.success("Link nusxalandi!");
  }

  function handleShareViaGmail() {
    if (!botLink) {
      toast.error("Bot linki mavjud emas.");
      return;
    }

    const subject = encodeURIComponent("Debug Bot Link");
    const body = encodeURIComponent(`Debug bot link:\n${botLink}`);
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`,
      "_blank"
    );
  }

  function handleShareViaTelegram() {
    if (!botLink) {
      toast.error("Bot linki mavjud emas.");
      return;
    }

    const text = encodeURIComponent(`Debug bot link: ${botLink}`);
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(botLink)}&text=${text}`,
      "_blank"
    );
  }


  if (project)
    return (
      <>
        <BottomButtonGroup>
          {project.debug.status === "running" ? (
            <>
              <BottomPanelButton size={'default'} onClick={handleStopBot}>
                <StopCircle size={16} />
                <CountdownComponent updated_at={project.debug.updated_at} />
              </BottomPanelButton>
              <BottomPanelButton
                onClick={handleRunAndRelaodDebugBot}
              >
                <RotateCcw size={16} />
              </BottomPanelButton>

              {/* open debug bot */}
              <BottomPanelButton size={'default'} asChild>
                <a
                  href={botLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BotMessageSquare className="h-4 w-4" />
                  Open bot
                </a>
              </BottomPanelButton>

              {/* share  */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <BottomPanelButton size={'icon'}>
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

            </>
          ) : project.debug.status === "initializing" ? (
            <BottomPanelButton size={'icon'} disabled>
              <LoaderCircle className="h-4 w-4 animate-spin" />
            </BottomPanelButton>
          ) : (
            <BottomPanelButton onClick={handleRunAndRelaodDebugBot} variant="outline">
              <PlayIcon />
            </BottomPanelButton>
          )}
        </BottomButtonGroup>

        {limitError && (
          <RunningBotLimitModal
            open={limitError !== null}
            onOpenChange={(v) => { if (!v) setLimitError(null); }}
            errorData={limitError}
            currentProjectId={id}
            onStopSuccess={handleRunAndRelaodDebugBot}
          />
        )}
      </>
    );
}
