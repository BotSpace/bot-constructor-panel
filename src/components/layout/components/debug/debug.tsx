"use client";

import React, { useEffect } from "react";
import { BugPlay, RotateCcw, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

import { instanceAuth } from "@/services/instance";

import { Button } from "@/components/ui/button";

import useProjectStore from "@/features/bot-constructor/store/project";
import { AddEnvDialog } from "../add-env";

/* ----------------------------- HEADER ACTIONS ----------------------------- */
export default function DebugActions() {
  const { id }: { id: string } = useParams();
  const { loadProject, project, changeProjectStatus } = useProjectStore();

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
  function handleRunAndReloadBot() {
    instanceAuth
      .get(`/project/${id}/debug/`)
      .then(() => {
        changeProjectStatus("initializing");
        toast.success("Bot ishga tushirilmoqda...");
      })
      .catch(() => {
        toast.error("Botni ishga tushirishda xatolik yuz berdi.");
      });
  }

  function handleStopBot() {
    instanceAuth
      .get(`/project/${id}/stop/`)
      .then(() => {
        toast.success("Bot muvaffaqiyatli to'xtatildi!");
        changeProjectStatus("stopped");
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
            onSuccess={() => loadProject(id)}
          >
            <Button>Add Debug Bot</Button>
          </AddEnvDialog>
        ) : (
          <>
            {project.debug.status === "running" ? (
              <div className="flex gap-1">
                <Button size={"icon"} onClick={handleStopBot} variant="outline">
                  <StopCircle />
                </Button>
                <Button
                  onClick={handleRunAndReloadBot}
                  variant="outline"
                  className="cursor-pointer"
                  size={"icon"}
                >
                  <RotateCcw />
                </Button>
              </div>
            ) : project.debug.status === "initializing" ? (
              <Button variant="outline" disabled>
                <span className="animate-pulse">Starting...</span>
              </Button>
            ) : (
              <Button onClick={handleRunAndReloadBot} variant="outline">
                <BugPlay />
                DEBUG
              </Button>
            )}
          </>
        )}
      </div>
    );
}
