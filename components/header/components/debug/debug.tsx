"use client";

import React, { useEffect } from "react";
import { BugPlay, RotateCcw, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

import { instanceAuth } from "@/services/instance";

import { Button } from "@/components/ui/button";

import useProjectStore from "@/constructor/store/project";
import { SetEnvDialog } from "../add-env";

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
          <SetEnvDialog
            env_name="BOT_TOKEN"
            project_id={+id}
            dialog_title="Debug Bot qo‘shish"
            dialog_description="Telegram debug bot tokenini kiriting"
            onSuccess={() => loadProject(id)}
          >
            <Button>Add Debug Bot</Button>
          </SetEnvDialog>
        ) : (
          <>
            {status === "running" ? (
              <>
                <Button onClick={handleStopBot} variant="outline">
                  <StopCircle className="mr-1 h-4 w-4" />
                  STOP
                </Button>
                <Button
                  onClick={handleRunAndReloadBot}
                  variant="outline"
                  className="cursor-pointer"
                >
                  <RotateCcw className="mr-1 h-4 w-4" />
                  RELOAD
                </Button>
              </>
            ) : status === "initializing" ? (
              <Button variant="outline" disabled>
                <span className="animate-pulse">Starting...</span>
              </Button>
            ) : status === "loading" ? (
              <Button variant="outline" disabled>
                <span className="animate-pulse">Loading...</span>
              </Button>
            ) : (
              <Button onClick={handleRunAndReloadBot} variant="outline">
                <BugPlay className="mr-1 h-4 w-4" />
                DEBUG
              </Button>
            )}
          </>
        )}
      </div>
    );
}
