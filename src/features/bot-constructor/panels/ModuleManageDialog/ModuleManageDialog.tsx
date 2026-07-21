"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Puzzle, Plus, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import {
  getProjectModules,
  listAvailableModules,
  enableModule,
  disableModule,
} from "@/services/requests/module";
import { ProjectModule, AvailableModule, ModuleStatus } from "@/types/http/module";
import { cn } from "@/lib/utils";
import { useModuleManifestStore } from "@/features/bot-constructor/manifest/moduleManifestStore";

interface ModuleManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

function statusBadgeVariant(
  status: ModuleStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "running":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}

function statusLabel(status: ModuleStatus): string {
  switch (status) {
    case "running":
      return "Faol";
    case "pending":
      return "Kutmoqda";
    case "failed":
      return "Xato";
    case "stopped":
      return "To'xtatilgan";
    default:
      return status;
  }
}

export function ModuleManageDialog({
  open,
  onOpenChange,
  projectId,
}: ModuleManageDialogProps) {
  const queryClient = useQueryClient();
  const startPoll = useModuleManifestStore((s) => s.startPoll);

  // Enabled modules list
  const {
    data: projectModules,
    isLoading: modulesLoading,
    refetch: refetchModules,
  } = useQuery<ProjectModule[]>({
    queryKey: ["project-modules", projectId],
    queryFn: () => getProjectModules(projectId),
    enabled: open && !!projectId,
    staleTime: 10_000,
    retry: false,
  });

  // Global catalog
  const { data: availableModules, isLoading: catalogLoading } = useQuery<AvailableModule[]>({
    queryKey: ["available-modules"],
    queryFn: listAvailableModules,
    enabled: open,
    staleTime: 60_000,
    retry: false,
  });

  // Enable mutation
  const enableMutation = useMutation({
    mutationFn: ({ slug }: { slug: string }) => enableModule(projectId, slug),
    onSuccess: () => {
      toast.success("Modul yoqildi");
      void queryClient.invalidateQueries({ queryKey: ["project-modules", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["node-manifests", projectId] });
      startPoll();
    },
    onError: () => {
      toast.error("Modulni yoqishda xatolik yuz berdi");
    },
  });

  // Disable mutation
  const disableMutation = useMutation({
    mutationFn: ({ slug }: { slug: string }) => disableModule(projectId, slug),
    onSuccess: () => {
      toast.success("Modul o'chirildi");
      void queryClient.invalidateQueries({ queryKey: ["project-modules", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["node-manifests", projectId] });
      startPoll();
    },
    onError: () => {
      toast.error("Modulni o'chirishda xatolik yuz berdi");
    },
  });

  // Pending delete confirmation
  const [pendingDisable, setPendingDisable] = useState<ProjectModule | null>(null);

  // Enabled slugs set for quick lookup
  const enabledSlugs = new Set(
    (projectModules ?? []).map((pm) => pm.module.slug)
  );

  const isAnyMutating =
    enableMutation.isPending || disableMutation.isPending;

  const handleEnable = (slug: string) => {
    if (isAnyMutating) return;
    enableMutation.mutate({ slug });
  };

  const handleDisableConfirm = () => {
    if (!pendingDisable) return;
    disableMutation.mutate({ slug: pendingDisable.module.slug });
    setPendingDisable(null);
  };

  // Reset pending on dialog close
  useEffect(() => {
    if (!open) setPendingDisable(null);
  }, [open]);

  const isLoading = modulesLoading || catalogLoading;

  // Modules that can be added (in catalog but not yet enabled)
  const addableModules = (availableModules ?? []).filter(
    (m) => !enabledSlugs.has(m.slug)
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[580px] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Puzzle className="h-5 w-5" />
              Modullar
            </DialogTitle>
            <DialogDescription>
              Ushbu loyiha uchun yoqilgan modullar va qo&apos;shimcha imkoniyatlar
            </DialogDescription>
          </DialogHeader>

          {/* ── Enabled modules list ─────────────────────────────────────── */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              Yoqilgan modullar
            </p>

            <div className="min-h-[80px] max-h-[240px] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : !projectModules || projectModules.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Hech qanday modul yoqilmagan
                </p>
              ) : (
                <div className="space-y-1.5">
                  {projectModules.map((pm) => (
                    <div
                      key={pm.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-4 py-2.5",
                        "group hover:bg-muted/40 transition-colors"
                      )}
                    >
                      {/* Icon placeholder or emoji */}
                      <span className="text-lg shrink-0 leading-none">
                        {pm.module.icon || "🧩"}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {pm.module.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {pm.module.slug}
                        </p>
                      </div>

                      <Badge
                        variant={statusBadgeVariant(pm.status)}
                        className={cn(
                          "text-[10px] shrink-0",
                          pm.status === "running" && "bg-emerald-600"
                        )}
                      >
                        {statusLabel(pm.status)}
                      </Badge>

                      {/* Disable action — appears on hover */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        title="O'chirish"
                        disabled={isAnyMutating}
                        onClick={() => setPendingDisable(pm)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Available catalog ─────────────────────────────────────────── */}
          <>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                  Qo&apos;shish mumkin
                </p>
                {catalogLoading ? (
                  <p className="text-center text-xs text-muted-foreground py-4">Yuklanmoqda…</p>
                ) : addableModules.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    Hozircha mavjud modul yo&apos;q
                  </p>
                ) : (
                <div className="max-h-[200px] overflow-y-auto pr-1">
                  <div className="space-y-1.5">
                    {addableModules.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 rounded-lg border px-4 py-2.5 hover:bg-muted/40 transition-colors"
                      >
                        <span className="text-lg shrink-0 leading-none">
                          {m.icon || "🧩"}
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{m.name}</p>
                          {m.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {m.description}
                            </p>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs shrink-0"
                          disabled={isAnyMutating}
                          onClick={() => handleEnable(m.slug)}
                        >
                          {enableMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                          Qo&apos;shish
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </div>
            </>


          <DialogFooter className="flex-row items-center gap-2 sm:justify-between">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-xs text-muted-foreground"
              onClick={() => void refetchModules()}
              disabled={modulesLoading}
            >
              <RefreshCw className={cn("h-3 w-3", modulesLoading && "animate-spin")} />
              Yangilash
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => onOpenChange(false)}
            >
              Yopish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable confirmation */}
      <AlertDialog
        open={pendingDisable !== null}
        onOpenChange={(v) => {
          if (!v && !disableMutation.isPending) setPendingDisable(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modulni o&apos;chirish</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{pendingDisable?.module.name}&quot; modulini bu loyihadan o&apos;chirishni
              xohlaysizmi? Bu modul node&apos;lari flow&apos;dan o&apos;chib ketadi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disableMutation.isPending}>
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableConfirm}
              disabled={disableMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disableMutation.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-4 w-4" />
              )}
              O&apos;chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
