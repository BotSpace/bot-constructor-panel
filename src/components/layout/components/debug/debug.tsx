"use client";

import React, { useEffect } from "react";
import { BotMessageSquare, BugPlay, RotateCcw, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

import { instanceAuth } from "@/services/instance";

import { Button, buttonVariants } from "@/components/ui/button";

import useProjectStore from "@/features/bot-constructor/store/project";
import { ButtonGroup } from "@/components/ui/button-group";
import { useFlowStore } from "@/features/bot-constructor/store";
import Link from "next/link";

/* ----------------------------- HEADER ACTIONS ----------------------------- */
export default function DebugActions() {
  const { id }: { id: string } = useParams();
  const { project, changeDebug } = useProjectStore();

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
      <ButtonGroup>
        {project.debug.status === "running" ? (
          <>
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
          </>
        ) : project.debug.status === "initializing" ? (
          <Button variant="outline" disabled>
            <span className="animate-pulse">Starting...</span>
          </Button>
        ) : (
          <Button onClick={handleRunAndRelaodDebugBot} variant="outline">
            <BugPlay />
          </Button>
        )}
        <Link
          href={`https://t.me/botmother_test_robot?start=${project?.debug_uuid}`}
          className={buttonVariants({ variant: "outline" })}
          target="_blank"
        >
          <BotMessageSquare />
          Open bot
        </Link>
      </ButtonGroup>
    );
}
