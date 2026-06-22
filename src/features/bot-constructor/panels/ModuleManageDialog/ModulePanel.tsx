"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Puzzle,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Zap,
  Box,
  Sparkles,
  Bot,
  Database,
  Globe,
  MessageSquare,
  CreditCard,
  Image,
  Calendar,
  Bell,
  type LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getProjectModules,
  listAvailableModules,
  enableModule,
  disableModule,
  getModuleDetail,
} from "@/services/requests/module";
import {
  ProjectModule,
  AvailableModule,
  ModuleStatus,
  ModuleDetail,
} from "@/types/http/module";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Module icon — `icon` is a Lucide name string (e.g. "sparkles"), not a glyph.
// Map known names → component; fall back to Puzzle. Curated map keeps the bundle
// small. ponytail: extend the map as new modules ship; no dynamic barrel import.
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  puzzle: Puzzle,
  box: Box,
  zap: Zap,
  bot: Bot,
  database: Database,
  globe: Globe,
  "message-square": MessageSquare,
  message: MessageSquare,
  "credit-card": CreditCard,
  payment: CreditCard,
  image: Image,
  calendar: Calendar,
  bell: Bell,
};

function ModuleIcon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  const Ico = (name && ICON_MAP[name.toLowerCase()]) || Puzzle;
  return <Ico className={className} />;
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Minimal Markdown renderer (~50 lines, no extra deps)
// Supports: h1-h3, bold, italic, inline-code, code blocks, lists, links, hr, plain text
// ---------------------------------------------------------------------------
function renderMarkdown(md: string): React.ReactNode[] {
  const lines = md.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  const parseInline = (text: string): React.ReactNode[] => {
    // Bold **text**, italic *text*, inline `code`, [link](url)
    const parts: React.ReactNode[] = [];
    const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
      else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
      else if (m[4])
        parts.push(
          <code
            key={m.index}
            className="rounded bg-white/10 px-1 py-0.5 text-[12px] font-mono text-emerald-300"
          >
            {m[4]}
          </code>
        );
      else if (m[5] && m[6])
        parts.push(
          <a
            key={m.index}
            href={m[6]}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-2"
          >
            {m[5]}
          </a>
        );
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(
        <pre
          key={i}
          className="my-3 overflow-x-auto rounded-lg bg-white/5 p-3 text-[12px] font-mono text-zinc-300"
        >
          {lang && (
            <div className="mb-1 text-[10px] uppercase tracking-widest text-zinc-500">
              {lang}
            </div>
          )}
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i++;
      continue;
    }

    // Headings
    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h1) {
      nodes.push(
        <h1 key={i} className="mb-2 mt-4 text-lg font-bold text-white">
          {parseInline(h1[1])}
        </h1>
      );
      i++;
      continue;
    }
    if (h2) {
      nodes.push(
        <h2 key={i} className="mb-1.5 mt-4 text-base font-semibold text-white">
          {parseInline(h2[1])}
        </h2>
      );
      i++;
      continue;
    }
    if (h3) {
      nodes.push(
        <h3 key={i} className="mb-1 mt-3 text-sm font-semibold text-zinc-200">
          {parseInline(h3[1])}
        </h3>
      );
      i++;
      continue;
    }

    // HR
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={i} className="my-3 border-white/10" />);
      i++;
      continue;
    }

    // Unordered list
    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={i} className="my-2 space-y-0.5 pl-4">
          {items.map((it, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-zinc-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500" />
              <span>{parseInline(it)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      let num = 1;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
        num++;
      }
      nodes.push(
        <ol key={i} className="my-2 space-y-0.5 pl-4">
          {items.map((it, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-zinc-300">
              <span className="shrink-0 text-zinc-500">{idx + 1}.</span>
              <span>{parseInline(it)}</span>
            </li>
          ))}
        </ol>
      );
      void num;
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    nodes.push(
      <p key={i} className="my-1.5 text-sm leading-relaxed text-zinc-300">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return nodes;
}

// ---------------------------------------------------------------------------
// Module item rows
// ---------------------------------------------------------------------------
interface InstalledItemProps {
  pm: ProjectModule;
  isAnyMutating: boolean;
  onDetail: (slug: string) => void;
  onDisable: (pm: ProjectModule) => void;
}

function InstalledItem({
  pm,
  isAnyMutating,
  onDetail,
  onDisable,
}: InstalledItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onDetail(pm.module.slug)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDetail(pm.module.slug);
        }
      }}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
        <ModuleIcon name={pm.module.icon} className="h-4 w-4 text-zinc-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{pm.module.name}</p>
        <p className="text-[11px] text-zinc-500 font-mono truncate">{pm.module.slug}</p>
      </div>
      <Badge
        variant={statusBadgeVariant(pm.status)}
        className={cn(
          "text-[10px] shrink-0",
          pm.status === "running" && "bg-emerald-600 text-white"
        )}
      >
        {statusLabel(pm.status)}
      </Badge>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
        title="O'chirish"
        disabled={isAnyMutating}
        onClick={(e) => {
          e.stopPropagation();
          onDisable(pm);
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

interface AvailableItemProps {
  m: AvailableModule;
  isAnyMutating: boolean;
  isEnablingThis: boolean;
  onDetail: (slug: string) => void;
  onEnable: (slug: string) => void;
}

function AvailableItem({
  m,
  isAnyMutating,
  isEnablingThis,
  onDetail,
  onEnable,
}: AvailableItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onDetail(m.slug)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDetail(m.slug);
        }
      }}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
        <ModuleIcon name={m.icon} className="h-4 w-4 text-zinc-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{m.name}</p>
        {m.description && (
          <p className="text-[11px] text-zinc-500 line-clamp-1">{m.description}</p>
        )}
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-7 gap-1 text-xs shrink-0 border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
        disabled={isAnyMutating}
        onClick={(e) => {
          e.stopPropagation();
          onEnable(m.slug);
        }}
      >
        {isEnablingThis ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Plus className="h-3 w-3" />
        )}
        O&apos;rnatish
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Module detail view
// ---------------------------------------------------------------------------
interface ModuleDetailViewProps {
  slug: string;
  installedSlugs: Set<string>;
  installedEntry: ProjectModule | undefined;
  isAnyMutating: boolean;
  enablingSlug: string | null;
  onEnable: (slug: string) => void;
  onDisable: (pm: ProjectModule) => void;
  onBack: () => void;
}

function ModuleDetailView({
  slug,
  installedSlugs,
  installedEntry,
  isAnyMutating,
  enablingSlug,
  onEnable,
  onDisable,
  onBack,
}: ModuleDetailViewProps) {
  const isInstalled = installedSlugs.has(slug);

  const { data: detail, isLoading } = useQuery<ModuleDetail>({
    queryKey: ["module-detail", slug],
    queryFn: () => getModuleDetail(slug),
    staleTime: 60_000,
    retry: false,
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Back header */}
      <div className="shrink-0 flex items-center gap-3 border-b border-white/10 bg-[#171717] px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:bg-white/10 hover:text-white shrink-0"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {detail?.name ?? slug}
          </p>
          <p className="text-xs text-zinc-500 font-mono truncate">{slug}</p>
        </div>
        {isInstalled && installedEntry ? (
          <Badge
            variant={statusBadgeVariant(installedEntry.status)}
            className={cn(
              "text-[10px] shrink-0",
              installedEntry.status === "running" && "bg-emerald-600 text-white"
            )}
          >
            {statusLabel(installedEntry.status)}
          </Badge>
        ) : null}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {isLoading ? (
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4 bg-white/8" />
            <Skeleton className="h-4 w-full bg-white/8" />
            <Skeleton className="h-4 w-5/6 bg-white/8" />
            <Skeleton className="h-4 w-2/3 bg-white/8" />
            <div className="pt-4 space-y-2">
              <Skeleton className="h-8 w-full bg-white/8" />
              <Skeleton className="h-8 w-full bg-white/8" />
            </div>
          </div>
        ) : detail ? (
          <div className="p-5 pb-6">
            {/* Icon + name */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <ModuleIcon name={detail.icon} className="h-6 w-6 text-zinc-300" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{detail.name}</h2>
                {detail.description && (
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                    {detail.description}
                  </p>
                )}
              </div>
            </div>

            {/* Nodes list */}
            {detail.nodes && detail.nodes.length > 0 && (
              <div className="mb-5">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Beradigan node&apos;lar
                </p>
                <div className="space-y-1.5">
                  {detail.nodes.map((node) => (
                    <div
                      key={node.type}
                      className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/3 px-3 py-2"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5">
                        {node.trigger ? (
                          <Zap className="h-3.5 w-3.5 text-blue-400" />
                        ) : (
                          <Box className="h-3.5 w-3.5 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {node.title}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono truncate">
                          {node.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {node.trigger && (
                          <span className="inline-flex items-center rounded border border-blue-500/25 bg-blue-500/15 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-blue-400 leading-none">
                            Trigger
                          </span>
                        )}
                        {node.category && (
                          <span className="text-[10px] text-zinc-600 truncate max-w-[80px]">
                            {node.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Docs markdown */}
            {detail.docs && (
              <div className="mb-5">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Hujjat
                </p>
                <div className="rounded-lg border border-white/8 bg-white/3 px-4 py-3">
                  {renderMarkdown(detail.docs)}
                </div>
              </div>
            )}

            {/* Action button */}
            <div className="pt-2">
              {isInstalled && installedEntry ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full gap-2"
                  disabled={isAnyMutating}
                  onClick={() => onDisable(installedEntry)}
                >
                  {isAnyMutating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  O&apos;chirish
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                  disabled={isAnyMutating}
                  onClick={() => onEnable(slug)}
                >
                  {enablingSlug === slug ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  O&apos;rnatish
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-sm text-zinc-500">
            <Puzzle className="h-8 w-8 opacity-30" />
            <span>Ma&apos;lumot topilmadi</span>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeletons
// ---------------------------------------------------------------------------
function ListSkeleton() {
  return (
    <div className="p-3 space-y-2">
      {[1, 2, 3].map((k) => (
        <div key={k} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="h-9 w-9 rounded-lg bg-white/8 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-2/3 bg-white/8" />
            <Skeleton className="h-3 w-1/2 bg-white/8" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ModulePanel component
// ---------------------------------------------------------------------------
interface ModulePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function ModulePanel({ open, onOpenChange, projectId }: ModulePanelProps) {
  const queryClient = useQueryClient();
  const [detailSlug, setDetailSlug] = useState<string | null>(null);
  const [pendingDisable, setPendingDisable] = useState<ProjectModule | null>(null);
  const [enablingSlug, setEnablingSlug] = useState<string | null>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setDetailSlug(null);
      setPendingDisable(null);
      setEnablingSlug(null);
    }
  }, [open]);

  // --- Installed modules ---
  const { data: projectModules, isLoading: modulesLoading } = useQuery<ProjectModule[]>({
    queryKey: ["project-modules", projectId],
    queryFn: () => getProjectModules(projectId),
    enabled: open && !!projectId,
    staleTime: 10_000,
    retry: false,
  });

  // --- Available catalog ---
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
      toast.success("Modul o'rnatildi");
      setEnablingSlug(null);
      void queryClient.invalidateQueries({ queryKey: ["project-modules", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["module-manifests", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["available-modules"] });
    },
    onError: () => {
      toast.error("Modulni o'rnatishda xatolik yuz berdi");
      setEnablingSlug(null);
    },
  });

  // Disable mutation
  const disableMutation = useMutation({
    mutationFn: ({ slug }: { slug: string }) => disableModule(projectId, slug),
    onSuccess: () => {
      toast.success("Modul o'chirildi");
      setPendingDisable(null);
      void queryClient.invalidateQueries({ queryKey: ["project-modules", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["module-manifests", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["available-modules"] });
    },
    onError: () => {
      toast.error("Modulni o'chirishda xatolik yuz berdi");
    },
  });

  const isAnyMutating = enableMutation.isPending || disableMutation.isPending;

  const enabledSlugs = new Set((projectModules ?? []).map((pm) => pm.module.slug));
  const addableModules = (availableModules ?? []).filter((m) => !enabledSlugs.has(m.slug));

  const handleEnable = (slug: string) => {
    if (isAnyMutating) return;
    setEnablingSlug(slug);
    enableMutation.mutate({ slug });
  };

  const handleDisableConfirm = () => {
    if (!pendingDisable) return;
    disableMutation.mutate({ slug: pendingDisable.module.slug });
  };

  const handleDetail = (slug: string) => {
    setDetailSlug(slug);
  };

  const handleBack = () => {
    setDetailSlug(null);
  };

  const installedEntry = detailSlug
    ? projectModules?.find((pm) => pm.module.slug === detailSlug)
    : undefined;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
        <SheetContent
          side="right"
          showOverlay={false}
          showCloseButton={false}
          onInteractOutside={() => onOpenChange(false)}
          className={cn(
            "w-full gap-0 overflow-hidden border-l border-white/10 bg-[#141414] p-0 text-white shadow-2xl",
            "sm:max-w-[420px]"
          )}
        >
          {detailSlug ? (
            // Detail view
            <ModuleDetailView
              slug={detailSlug}
              installedSlugs={enabledSlugs}
              installedEntry={installedEntry}
              isAnyMutating={isAnyMutating}
              enablingSlug={enablingSlug}
              onEnable={handleEnable}
              onDisable={(pm) => setPendingDisable(pm)}
              onBack={handleBack}
            />
          ) : (
            // List view with tabs
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <SheetHeader className="shrink-0 gap-0 space-y-0 border-b border-white/10 bg-[#171717] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                    <Puzzle className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <SheetTitle className="text-base font-semibold text-white leading-tight">
                      Modullar
                    </SheetTitle>
                    <SheetDescription className="text-xs text-zinc-500 mt-0.5">
                      Loyiha uchun qo&apos;shimcha imkoniyatlar
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Tabs */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <Tabs defaultValue="installed" className="flex flex-col flex-1 min-h-0 gap-0">
                  <TabsList className="shrink-0 mx-4 mt-3 mb-0 w-auto rounded-lg bg-white/5 border border-white/10 h-9">
                    <TabsTrigger
                      value="installed"
                      className="flex-1 text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400"
                    >
                      O&apos;rnatilgan
                      {projectModules && projectModules.length > 0 && (
                        <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] leading-none">
                          {projectModules.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="available"
                      className="flex-1 text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white text-zinc-400"
                    >
                      Mavjud
                      {addableModules.length > 0 && (
                        <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] leading-none">
                          {addableModules.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* Installed tab */}
                  <TabsContent value="installed" className="flex-1 min-h-0 mt-2 overflow-hidden">
                    <ScrollArea className="h-full">
                      {modulesLoading ? (
                        <ListSkeleton />
                      ) : !projectModules || projectModules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-sm text-zinc-500">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/8 bg-white/3">
                            <Puzzle className="h-6 w-6 opacity-40" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-zinc-400">Modul yo&apos;q</p>
                            <p className="text-xs mt-0.5">
                              &quot;Mavjud&quot; tabidan modul o&apos;rnating
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 flex flex-col gap-1">
                          {projectModules.map((pm) => (
                            <InstalledItem
                              key={pm.id}
                              pm={pm}
                              isAnyMutating={isAnyMutating}
                              onDetail={handleDetail}
                              onDisable={(p) => setPendingDisable(p)}
                            />
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  {/* Available tab */}
                  <TabsContent value="available" className="flex-1 min-h-0 mt-2 overflow-hidden">
                    <ScrollArea className="h-full">
                      {catalogLoading ? (
                        <ListSkeleton />
                      ) : addableModules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-sm text-zinc-500">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/8 bg-white/3">
                            <Puzzle className="h-6 w-6 opacity-40" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-zinc-400">Hammasi o&apos;rnatilgan</p>
                            <p className="text-xs mt-0.5">Yangi modullar tez orada qo&apos;shiladi</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 flex flex-col gap-1">
                          {addableModules.map((m) => (
                            <AvailableItem
                              key={m.id}
                              m={m}
                              isAnyMutating={isAnyMutating}
                              isEnablingThis={enablingSlug === m.slug && enableMutation.isPending}
                              onDetail={handleDetail}
                              onEnable={handleEnable}
                            />
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Disable confirmation dialog */}
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
