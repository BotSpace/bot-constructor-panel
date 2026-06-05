"use client";

import React, { useState } from "react";
import { LoaderCircle, Bug, Radio } from "lucide-react";
import { toast } from "sonner";

import { instanceAuth } from "@/services/instance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface RunningBot {
  project_id: number;
  name: string;
  kind: "debug" | "release";
  release_id?: number;
}

export interface RunningBotLimitError {
  status: false;
  detail: string;
  code: "running_bot_limit";
  limit: number;
  running: RunningBot[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Limit payload returned by the 409 response */
  errorData: RunningBotLimitError;
  /** project_id of the current project (to show "(shu loyiha)" label) */
  currentProjectId: string | number;
  /** Called after stop succeeds so the caller can retry its original action */
  onStopSuccess: () => void;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function RunningBotLimitModal({
  open,
  onOpenChange,
  errorData,
  currentProjectId,
  onStopSuccess,
}: Props) {
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [stopping, setStopping] = useState(false);

  const { limit, running } = errorData;

  // Stable key for each entry so radio works correctly.
  function botKey(bot: RunningBot): string {
    return bot.kind === "debug"
      ? `debug-${bot.project_id}`
      : `release-${bot.release_id ?? bot.project_id}`;
  }

  async function handleStopAndContinue() {
    if (!selectedKey) return;

    const bot = running.find((b) => botKey(b) === selectedKey);
    if (!bot) return;

    setStopping(true);
    try {
      if (bot.kind === "debug") {
        await instanceAuth.get(`/project/${bot.project_id}/stop/`);
      } else {
        const releaseId = bot.release_id;
        if (!releaseId) {
          toast.error("Release ID topilmadi.");
          return;
        }
        await instanceAuth.get(`/relase/${releaseId}/stop/`);
      }

      toast.success(`"${bot.name}" to'xtatildi.`);
      onOpenChange(false);
      // Small delay so the backend registers the stopped state before retry.
      setTimeout(() => {
        onStopSuccess();
      }, 600);
    } catch {
      toast.error("To'xtatishda xatolik yuz berdi.");
    } finally {
      setStopping(false);
    }
  }

  function handleCancel() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Botlar soni limiti</DialogTitle>
          <DialogDescription>
            Bir vaqtda ko&apos;pi bilan{" "}
            <span className="font-semibold text-foreground">{limit}</span> ta
            bot ishlaydi. Davom etish uchun bittasini to&apos;xtating:
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selectedKey}
          onValueChange={setSelectedKey}
          className="gap-2"
        >
          {running.map((bot) => {
            const key = botKey(bot);
            const isCurrent =
              String(bot.project_id) === String(currentProjectId);
            const isDebug = bot.kind === "debug";

            return (
              <label
                key={key}
                htmlFor={key}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                  "hover:bg-accent",
                  selectedKey === key && "border-primary bg-accent"
                )}
              >
                <RadioGroupItem id={key} value={key} />

                <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                  <span className="truncate text-sm font-medium">
                    {bot.name}
                    {isCurrent && (
                      <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                        (shu loyiha)
                      </span>
                    )}
                  </span>

                  <Badge
                    variant={isDebug ? "outline" : "default"}
                    className={cn(
                      "shrink-0 gap-1 text-xs",
                      isDebug
                        ? "border-orange-400 text-orange-600 dark:text-orange-400"
                        : "bg-blue-500 text-white border-transparent"
                    )}
                  >
                    {isDebug ? (
                      <Bug className="size-3" />
                    ) : (
                      <Radio className="size-3" />
                    )}
                    {isDebug ? "debug" : "release"}
                  </Badge>
                </div>
              </label>
            );
          })}
        </RadioGroup>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} disabled={stopping}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleStopAndContinue}
            disabled={!selectedKey || stopping}
          >
            {stopping ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                To&apos;xtatilmoqda...
              </>
            ) : (
              "Toʻxtatib davom etish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
