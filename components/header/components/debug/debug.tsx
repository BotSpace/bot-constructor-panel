"use client";

import React, { useEffect } from "react";
import { shallow } from "zustand/shallow";
import { BugPlay, RotateCcw, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

import { useFlowStore } from "@/constructor/store";
import useUserStore from "@/services/store/project";
import { instanceAuth } from "@/services/instance";
import { useReactQueryAction } from "@/services/react-query";

import { Button } from "@/components/ui/button";

import { Env } from "@/types/http/bot";
import { APIResponseType } from "@/types/http";
import { Project } from "@/types/constructor/project";
import { AddBotDialog } from "../add-env";

/* ----------------------------- HEADER ACTIONS ----------------------------- */
export default function HeaderActions() {
  const { id }: { id: string } = useParams();

  const { loading, response, status, fetchProject, changeResponseStatus } =
    useUserStore((s) => s);

  const { loadFlow } = useFlowStore(
    (s) => ({
      isDirty: s.isDirty,
      loadFlow: s.loadFlow,
      saveFlow: s.saveFlow,
    }),
    shallow
  );

  const { data: debugBotEnv, error } = useReactQueryAction<
    APIResponseType<Env>
  >({
    url: `enviroment/BOT_TOKEN/?project=${id}`,
  });

  /* ------------------------- Load flow on project fetch ------------------------- */
  useEffect(() => {
    if (response && !loading) {
      loadFlow(response.data.flow);
    }
  }, [response, loading, loadFlow]);

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
    if (!response?.data?.id) return;
    changeResponseStatus("initializing");

    instanceAuth
      .get(`/project/${response.data.id}/debug/`)
      .then(() => {
        changeResponseStatus("running");
        toast.success("Bot ishga tushirilmoqda...");
      })
      .catch(() => {
        toast.error("Botni ishga tushirishda xatolik yuz berdi.");
      });
  }

  function handleStopBot() {
    if (!response?.data?.id) return;

    instanceAuth
      .get(`/project/${response.data.id}/stop/`)
      .then(() => {
        toast.success("Bot muvaffaqiyatli to'xtatildi!");
        changeResponseStatus("stopped");
      })
      .catch(() => {
        toast.error("Botni to'xtatishda xatolik yuz berdi.");
      });
  }

  /* ------------------------- Polling for status update ------------------------- */
  useEffect(() => {
    const projectDebugStatus = response?.data?.debug?.status;

    if (projectDebugStatus === "initializing" && id) {
      const interval = setInterval(async () => {
        try {
          const { data } = await instanceAuth.get<APIResponseType<Project>>(
            `/project/${id}`
          );

          // xavfsiz tarzda debug statusni o‘qish
          const updatedStatus = data.data.debug.status;

          // agar status mavjud bo‘lsa, store ni yangilaymiz
          if (updatedStatus && response) {
            changeResponseStatus(updatedStatus);
          }

          // initializing tugagach — pollingni to‘xtatamiz
          if (["running", "stopped", "error"].includes(updatedStatus)) {
            clearInterval(interval);
            toast.success("Bot ishga tushdi!");
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 5000);

      // cleanup
      return () => clearInterval(interval);
    }
  }, [response?.data?.debug?.status, id, changeResponseStatus]);

  /* -------------------------- Fetch project first time -------------------------- */
  useEffect(() => {
    if (id) fetchProject(id);
  }, [id, fetchProject]);

  if (error)
    return (
      <div className="flex items-center gap-3">
        {error?.status === 404 ? (
          <AddBotDialog
            env_name="BOT_TOKEN"
            project_id={+id}
            dialog_title="Debug Bot qo‘shish"
            dialog_description="Telegram debug bot tokenini kiriting"
          >
            <Button>Add Debug Bot</Button>
          </AddBotDialog>
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
