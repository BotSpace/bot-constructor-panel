"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BotMessageSquare,
  RotateCcw,
  StopCircle,
  Copy,
  Mail,
  Share2,
  LoaderCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";

import { instanceAuth } from "@/services/instance";
import type { ProjectRetrive } from "@/types/http/project";
import type { APIDetailCreateResponse } from "@/types/http/response";

import useProjectStore from "@/features/bot-constructor/store/project";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BottomButtonGroup from "@/features/bot-constructor/panels/bottom-panel/components/button-group";
import { BottomPanelButton } from "@/features/bot-constructor/panels/bottom-panel/components/button";
import { PlayIcon } from "@/components/icons/play";
import CountdownComponent from "@/components/common/count-down/count-down";
import {
  RunningBotLimitModal,
  RunningBotLimitError,
} from "@/components/layout/running-bot-limit-modal";

/**
 * Statuses where the engine pod is still STARTING — show spinner.
 * "pending"     — backend'dan WS orqali kelishi mumkin (deploy queue'da kutish)
 * "initializing"— local optimistic va backend'dan kelishi mumkin (pod ko'tarilmoqda)
 *
 * "stopping" ATAYIN yo'q: stop optimistik "stopped" qiladi (Play ko'rinadi). Agar
 * backend WS "stopping" yuborsa va u LOADING'da bo'lsa, debug yozuvi o'chganda
 * (pod ketganda) polling status'ni ololmay spinner abadiy qotib qolardi.
 */
const LOADING_STATUSES = new Set(["initializing", "pending"]);

/* ----------------------------- HEADER ACTIONS ----------------------------- */
export default function DebugingButtons() {
  const { id }: { id: string } = useParams();
  const { project, changeDebug } = useProjectStore();

  // Store'dan kerakli qismlarni olamiz
  const { saveFlow } = useFlowStore();

  const [limitError, setLimitError] = useState<RunningBotLimitError | null>(
    null
  );

  // Polling: agar WS debug_status eventi kelmasa (yoki kech kelsa) va status
  // "loading" holatida qolsa, har 3s da backend'dan status tekshiramiz.
  // WS ishlasa u oldinda bo'ladi — polling faqat fallback.
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const status = project?.debug?.status;
    const isLoading = status !== undefined && LOADING_STATUSES.has(status);

    if (isLoading) {
      // Avvalgi polling bo'lsa to'xtatamiz
      if (pollingRef.current) clearInterval(pollingRef.current);

      pollingRef.current = setInterval(() => {
        instanceAuth
          .get<APIDetailCreateResponse<ProjectRetrive>>(`/project/${id}`)
          .then(({ data }) => {
            const debug = data?.data?.debug;
            const current = useProjectStore.getState().project?.debug;
            if (!debug) {
              // Debug yozuvi yo'q = bot to'liq to'xtagan. Loading'dan chiqamiz.
              if (current && current.status !== "stopped") {
                changeDebug({ ...current, status: "stopped" });
              }
              return;
            }
            // Faqat status o'zgargan bo'lsagina yangilaymiz
            if (debug.status !== current?.status) {
              changeDebug(debug);
            }
          })
          .catch(() => {
            // Silent — WS asosiy kanal, polling faqat fallback
          });
      }, 3000);
    } else {
      // Loading holatidan chiqdik — pollingni to'xtatamiz
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [project?.debug?.status, id, changeDebug]);

  /* Ctrl+R is handled in constructor.tsx as a keyboard shortcut */

  /* --------------------------- Debug bot actions --------------------------- */
  async function handleRunAndRelaodDebugBot() {
    // Saqlash tugashini KUTAMIZ — aks holda PATCH va /debug/ poygada bo'lib,
    // backend eski flow bilan debug konteyner ko'tarishi mumkin.
    try {
      await saveFlow(id);
    } catch {
      toast.error("Flow saqlanmadi — debug bekor qilindi, qayta urinib ko'ring.");
      return;
    }

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
          ) : LOADING_STATUSES.has(project.debug.status) ? (
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
