"use client";

import { useEffect, useState, Suspense } from "react";
import Constructor from "@/features/bot-constructor/constructor";
import useProjectStore from "@/features/bot-constructor/store/project";
import { useParams, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { DebugConsole } from "@/components/layout/components/debug-console/debug-console";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import { ReactFlowProvider } from "reactflow";
import SearchPanel from "@/features/bot-constructor/search/search-panel";
import { useIsMobile } from "@/hooks/use-is-mobile";
import BottomPanel from "@/features/bot-constructor/components/bottom-panel";
import { AgentPanel } from "@/features/bot-constructor/components/AgentChat/AgentPanel";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLinkToParent } from "@/components/common/link-to-parrent";
import { ReleasePanel } from "@/components/layout/components/relas/relas";
import { EnvManageDialog } from "@/features/bot-constructor/components/EnvManageDialog/EnvManageDialog";
import DebugingButtons from "@/components/layout/components/debug/debug";
import { SaveStatusBadge } from "@/features/bot-constructor/components/save-status-badge";
import { Separator } from "@/components/ui/separator";

function PageInner() {
  const { id }: { id: string } = useParams();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? undefined;
  const { loadProject, project } = useProjectStore();
  const { loadCollections } = useCollectionStore();
  // AI panel closed by default — n8n style
  const [aiOpen, setAiOpen] = useState(false);
  const [isAiBuilding, setIsAiBuilding] = useState(!!initialPrompt);
  const [envOpen, setEnvOpen] = useState(false);

  useEffect(() => {
    if (project) {
      document.title = `${project.name} | BotMother.uz`;
    }
  }, [project?.id]);

  useEffect(() => {
    loadProject(id);
    loadCollections(id);
  }, []);

  const isMobile = useIsMobile();

  if (!project) return <ConstructorLoadingSkeletons isMobile={isMobile} />;

  // ── Mobile ─────────────────────────────────────────────────────────────────
  if (isMobile) {
    return <MobileView id={id} initialPrompt={initialPrompt} project={project} />;
  }

  // ── Desktop ─────────────────────────────────────────────────────────────────
  return (
    <main className="flex flex-col h-screen overflow-hidden bg-background">
      {/* ── N8n-style top bar ─────────────────────────────────── */}
      <N8nTopBar
        project={project}
        id={id}
        aiOpen={aiOpen}
        onToggleAI={() => setAiOpen((v) => !v)}
      />

      {/* ── Content row ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* AI Panel (left) */}
        <div
          className={cn(
            "h-full shrink-0 transition-all duration-200 overflow-hidden",
            aiOpen ? "w-[400px] border-r border-border" : "w-0 border-0"
          )}
        >
          {aiOpen && (
            <AgentPanel
              projectId={id}
              onCollapse={() => setAiOpen(false)}
              initialPrompt={initialPrompt}
              onBuildingChange={setIsAiBuilding}
            />
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          <ReactFlowProvider>
            <Constructor />
            <SearchPanel />
            <DebugConsole />
            <BottomPanel
              aiPanelOpen={aiOpen}
              onToggleAI={() => setAiOpen((v) => !v)}
            />
          </ReactFlowProvider>

          {isAiBuilding && <AiBuildingOverlay />}
        </div>
      </div>
    </main>
  );
}

// ── N8n-style top bar ─────────────────────────────────────────────────────────
function N8nTopBar({
  project,
  id,
  aiOpen,
  onToggleAI,
}: {
  project: { name: string };
  id: string;
  aiOpen: boolean;
  onToggleAI: () => void;
}) {
  const { handleClick: backToHome } = useLinkToParent({ href: `/bot/${id}` });

  return (
    <div className="h-11 shrink-0 flex items-center gap-2 px-3 border-b border-border bg-background z-10">
      {/* Back */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={backToHome}
        title="Orqaga"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      {/* Project name */}
      <span className="text-sm font-semibold truncate max-w-[220px]">
        {project.name}
      </span>

      {/* Save status */}
      <SaveStatusBadge />

      <div className="flex-1" />

      {/* AI toggle */}
      <Button
        variant={aiOpen ? "secondary" : "ghost"}
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={onToggleAI}
        title={aiOpen ? "AI panelni yopish" : "AI panelni ochish"}
      >
        <Sparkles
          className={cn("h-3.5 w-3.5", aiOpen && "text-primary")}
        />
        AI
      </Button>
    </div>
  );
}

// ── Mobile View ────────────────────────────────────────────────────────────
function MobileView({
  id,
  initialPrompt,
  project,
}: {
  id: string;
  initialPrompt?: string;
  project: { name: string };
}) {
  const [envOpen, setEnvOpen] = useState(false);
  const { handleClick: backToHome } = useLinkToParent({ href: `/bot/${id}` });

  return (
    <div
      className="flex flex-col h-[100dvh] bg-background overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* ── Top bar ── */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-border bg-background">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={backToHome}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{project.name}</p>
          <p className="text-[10px] text-muted-foreground leading-none">AI rejimi</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setEnvOpen(true)}
          title="Kalitlar"
        >
          <Key className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Debug + Publish strip ── */}
      <div className="shrink-0 px-3 py-1.5 border-b border-border bg-background overflow-x-auto">
        <div className="flex items-center gap-2 w-max">
          <DebugingButtons />
          <ReleasePanel />
        </div>
      </div>

      {/* ── AI Chat ── */}
      <div className="flex-1 overflow-hidden">
        <AgentPanel
          projectId={id}
          initialPrompt={initialPrompt}
          onBuildingChange={() => {}}
          hideHeader
        />
      </div>

      <EnvManageDialog open={envOpen} onOpenChange={setEnvOpen} projectId={id} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<ConstructorLoadingSkeletons isMobile={false} />}>
      <PageInner />
    </Suspense>
  );
}

// ── AI building overlay ───────────────────────────────────────────────────────
const SKELETON_NODES = [
  { w: 200, h: 72,  top: "18%", left: "32%" },
  { w: 220, h: 88,  top: "42%", left: "20%" },
  { w: 220, h: 88,  top: "42%", left: "54%" },
  { w: 200, h: 72,  top: "66%", left: "32%" },
  { w: 180, h: 64,  top: "66%", left: "62%" },
];

function AiBuildingOverlay() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-auto bg-background">
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {SKELETON_NODES.map((node, i) => (
        <div
          key={i}
          className="absolute rounded-xl border border-border bg-card shadow-sm overflow-hidden"
          style={{ width: node.w, height: node.h, top: node.top, left: node.left }}
        >
          <div className="h-7 w-full bg-muted animate-pulse" />
          <div className="p-2.5 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}

      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <line x1="42%" y1="26%" x2="30%" y2="42%" stroke="currentColor" strokeWidth="1.5"
          strokeDasharray="6 4" className="text-border animate-pulse opacity-50" />
        <line x1="42%" y1="26%" x2="64%" y2="42%" stroke="currentColor" strokeWidth="1.5"
          strokeDasharray="6 4" className="text-border animate-pulse opacity-50" />
        <line x1="30%" y1="56%" x2="42%" y2="66%" stroke="currentColor" strokeWidth="1.5"
          strokeDasharray="6 4" className="text-border animate-pulse opacity-50" />
        <line x1="64%" y1="56%" x2="72%" y2="66%" stroke="currentColor" strokeWidth="1.5"
          strokeDasharray="6 4" className="text-border animate-pulse opacity-50" />
      </svg>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border bg-card px-4 py-2 shadow-lg">
        <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
        <span className="text-xs font-medium text-muted-foreground">AI bot quryapti...</span>
        <span className="flex gap-0.5">
          {[0, 150, 300].map((d) => (
            <span
              key={d}
              className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

// ── Loading skeletons ─────────────────────────────────────────────────────────
function ConstructorLoadingSkeletons({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    return (
      <div className="flex flex-col h-[100dvh] bg-background">
        <div className="h-12 border-b flex items-center px-3 gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
        <div className="flex-1 p-4 flex flex-col gap-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-12 w-3/4 rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-12 w-2/3 rounded-xl" />
        </div>
        <div className="h-16 border-t px-4">
          <Skeleton className="h-10 w-full mt-3 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar skeleton */}
      <div className="h-11 border-b flex items-center gap-2 px-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-4 w-40" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
      {/* Canvas skeleton */}
      <div className="flex-1 grid grid-cols-12 grid-rows-12 gap-4 p-4">
        <Skeleton className="col-span-3 row-span-4 col-start-3 row-start-3" />
        <Skeleton className="col-span-3 col-start-4 row-start-8" />
        <Skeleton className="col-span-3 row-span-3 col-start-8 row-start-4" />
        <Skeleton className="col-span-3 row-span-2 col-start-7 row-start-8" />
      </div>
    </div>
  );
}
