"use client";

import React, { useEffect } from "react";
import {
  BotMessageSquare,
  BugPlay,
  RotateCcw,
  StopCircle,
  Copy,
  Mail,
  Share2,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

import { instanceAuth } from "@/services/instance";

import { Button, buttonVariants } from "@/components/ui/button";

import useProjectStore from "@/features/bot-constructor/store/project";
import { ButtonGroup } from "@/components/ui/button-group";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CoundDownButton from "@/components/common/count-down-button";
import { useNotificationContext } from "@/components/common/notification-provider";
import { createSimpleNotification } from "@/lib/notification-utils";

/* ----------------------------- HEADER ACTIONS ----------------------------- */
export default function DebugActions() {
  const { id }: { id: string } = useParams();
  const { project, changeDebug } = useProjectStore();
  const { sendNotification } = useNotificationContext();

  // Store'dan kerakli qismlarni olamiz
  const { saveFlow } = useFlowStore();

  /* ----------------------- Prevent Ctrl+R (refresh) ----------------------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r")
        e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* --------------------------- Debug bot actions --------------------------- */
  function handleRunAndRelaodDebugBot() {
    saveFlow(id);

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
      .catch(() => {
        toast.error("Botni ishga tushirishda xatolik yuz berdi.");
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
      <ButtonGroup id="open-bot-btn">
        {project.debug.status === "running" ? (
          <>
            <Button onClick={handleStopBot} variant="outline">
              <StopCircle />
              <CoundDownButton
                onComplete={() => {
                  sendNotification(
                    createSimpleNotification(
                      "Debug bot o'chirildi",
                      "Debug bot uchun ajiratilgan 30 daqiqa tugadi! Testni davom ettirish uchun debug botni qaytatdan ishga tushirign"
                    )
                  );
                }}
                date={
                  new Date(
                    new Date(project.debug.updated_at).getTime() +
                    30 * 60 * 1000
                  )
                }
                completed_component={null}
              />
            </Button>
            <Button
              onClick={handleRunAndRelaodDebugBot}
              variant="outline"
              className="cursor-pointer"
              size={"icon"}
            >
              <RotateCcw />
            </Button>

            {/* open debug bot */}
            <a
              href={botLink}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              <BotMessageSquare className="mr-2 h-4 w-4" />
              Open bot
            </a>

            {/* share  */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
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
          <Button variant="outline" disabled>
            <span className="animate-pulse">Starting...</span>
          </Button>
        ) : (
          <Button onClick={handleRunAndRelaodDebugBot} variant="outline">
            Run
            <Play />
          </Button>
        )}
      </ButtonGroup>
    );
}
