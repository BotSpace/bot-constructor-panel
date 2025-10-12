"use client";

import React, { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";
import { BugPlay, RotateCcw, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

import { useFlowStore } from "@/constructor/store";
import useUserStore from "@/services/store/project";
import { instanceAuth } from "@/services/instance";
import { useReactQueryAction } from "@/services/react-query";

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

import { Env } from "@/types/http/bot";
import { APIResponseType } from "@/types/http";
import { Project } from "@/types/constructor/project";

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

  console.log(
    "🔍 ~ HeaderActions ~ app/[id]/components/action/actions.tsx:44 ~ error:",
    error
  );

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
            `/project/${id}/`
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

  /* ---------------------------- Render section ---------------------------- */
  if (!response || !debugBotEnv) return null;

  return (
    <div className="flex items-center gap-3">
      {error?.status === 404 ? (
        <AddBotDialog
          bot_for="debug"
          project_id={+id}
          dialog_title="Debug Bot qo‘shish"
          dialog_description="Telegram debug bot tokenini kiriting"
        >
          <Button size="sm">Add Debug Bot</Button>
        </AddBotDialog>
      ) : (
        <>
          {status === "running" ? (
            <>
              <Button onClick={handleStopBot} variant="outline" size="sm">
                <StopCircle className="mr-1 h-4 w-4" />
                STOP
              </Button>
              <Button
                onClick={handleRunAndReloadBot}
                variant="outline"
                size="sm"
                className="cursor-pointer"
              >
                <RotateCcw className="mr-1 h-4 w-4" />
                RELOAD
              </Button>
            </>
          ) : status === "initializing" ? (
            <Button variant="outline" size="sm" disabled>
              <span className="animate-pulse">Starting...</span>
            </Button>
          ) : status === "loading" ? (
            <Button variant="outline" size="sm" disabled>
              <span className="animate-pulse">Loading...</span>
            </Button>
          ) : (
            <Button onClick={handleRunAndReloadBot} variant="outline" size="sm">
              <BugPlay className="mr-1 h-4 w-4" />
              DEBUG
            </Button>
          )}
        </>
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
  children,
}: {
  dialog_title: string;
  dialog_description: string;
  bot_for: "debug" | "release";
  project_id: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");

  const handleAddDebugBot = async () => {
    try {
      await instanceAuth.post("/enviroment/", {
        key: "BOT_TOKEN",
        value: token,
        project: project_id,
      });
      toast.success("Bot muvaffaqiyatli qo'shildi!");
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

        <Button onClick={handleAddDebugBot}>Add Bot</Button>
      </DialogContent>
    </Dialog>
  );
}
