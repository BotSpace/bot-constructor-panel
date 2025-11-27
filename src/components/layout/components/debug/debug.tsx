"use client";

import React, { useEffect } from "react";
import { BotMessageSquare, BugPlay, RotateCcw, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

import { instanceAuth } from "@/services/instance";

import { Button } from "@/components/ui/button";

import useProjectStore from "@/features/bot-constructor/store/project";
import { AddEnvDialog } from "../add-env";
import { ButtonGroup } from "@/components/ui/button-group";
import DebugBotEdit from "../debug-bot-edit";
import { useFlowStore } from "@/features/bot-constructor/store";

/* ----------------------------- HEADER ACTIONS ----------------------------- */
export default function DebugActions() {
  const { id }: { id: string } = useParams();
  const { project, changeDebug, changeProject } = useProjectStore();

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

  if (project)
    return (
      <div className="flex items-center gap-3">
        {!project.debug_bot ? (
          <AddEnvDialog
            env_name="BOT_TOKEN"
            project_id={+id}
            dialog_title="Debug Bot qo‘shish"
            dialog_description="Telegram debug bot tokenini kiriting"
            onSuccess={() => {
              changeProject({ ...project, debug_bot: true });
            }}
          >
            <Button>Add Debug Bot</Button>
          </AddEnvDialog>
        ) : (
          <>
            {project.debug.status === "running" ? (
              <ButtonGroup className="flex">
                <Button size={"icon"} onClick={handleStopBot} variant="outline">
                  <StopCircle />
                </Button>
                <Button
                  onClick={handleRunAndRelaodDebugBot}
                  variant="outline"
                  className="cursor-pointer"
                  size={"icon"}
                >
                  <RotateCcw />
                </Button>
                <DebugBotEdit>
                  <Button className="cursor-pointer" variant={"outline"}>
                    <BotMessageSquare />
                  </Button>
                </DebugBotEdit>
              </ButtonGroup>
            ) : project.debug.status === "initializing" ? (
              <Button variant="outline" disabled>
                <span className="animate-pulse">Starting...</span>
              </Button>
            ) : (
              <ButtonGroup>
                <Button onClick={handleRunAndRelaodDebugBot} variant="outline">
                  <BugPlay />
                </Button>
                <DebugBotEdit>
                  <Button className="cursor-pointer" variant={"outline"}>
                    <BotMessageSquare />
                  </Button>
                </DebugBotEdit>
              </ButtonGroup>
            )}
          </>
        )}
      </div>
    );
}
