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
import { OrientationGuard } from "@/components/common/OrientationGuard";
import BottomPanel from "@/features/bot-constructor/components/bottom-panel";
import { AgentPanel } from "@/features/bot-constructor/components/AgentChat/AgentPanel";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function PageInner() {
  const { id }: { id: string } = useParams();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? undefined;
  const { loadProject, project } = useProjectStore();
  const { loadCollections } = useCollectionStore();
  const [aiOpen, setAiOpen] = useState(true);
  const [isAiBuilding, setIsAiBuilding] = useState(!!initialPrompt);

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
  const [isOriented, setIsOriented] = useState(false);

  if (isMobile && !isOriented)
    return <OrientationGuard handleOrientDevice={() => setIsOriented(true)} />;

  if (!project) return <ConstructorLoadingSkeletons />;

  return (
    <main className="flex h-screen overflow-hidden bg-background">
      {/* ── AI Panel (left) ── */}
      <div
        className={cn(
          "h-full shrink-0 transition-all duration-200 overflow-hidden",
          aiOpen ? "w-[420px] border-r border-border" : "w-0 border-0"
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

      {/* ── Canvas (right) ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        <ReactFlowProvider>
          <Constructor />
          <SearchPanel />
          <DebugConsole />
          <BottomPanel aiPanelOpen={aiOpen} onToggleAI={() => setAiOpen(v => !v)} />
        </ReactFlowProvider>

        {/* AI building skeleton overlay */}
        {isAiBuilding && <AiBuildingOverlay />}

        {/* Open AI panel button (visible when panel is collapsed) */}
        {!aiOpen && (
          <Button
            variant="outline"
            size="sm"
            className="absolute top-3 left-3 z-20 gap-1.5 h-8 shadow-sm"
            onClick={() => setAiOpen(true)}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs">AI</span>
          </Button>
        )}
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<ConstructorLoadingSkeletons />}>
      <PageInner />
    </Suspense>
  );
}

// Skeleton node positions (simulate a real-looking flow)
const SKELETON_NODES = [
  { w: 200, h: 72,  top: "18%", left: "32%" },
  { w: 220, h: 88,  top: "42%", left: "20%" },
  { w: 220, h: 88,  top: "42%", left: "54%" },
  { w: 200, h: 72,  top: "66%", left: "32%" },
  { w: 180, h: 64,  top: "66%", left: "62%" },
];

function AiBuildingOverlay() {
  return (
    // pointer-events-auto + opaque bg — hamma interaktsiyani bloklaydi, orqa ko'rinmaydi
    <div className="absolute inset-0 z-10 pointer-events-auto bg-background">

      {/* Dot-grid pattern (React Flow style) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Skeleton nodes */}
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

      {/* Dashed connecting lines */}
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

      {/* Status badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border bg-card px-4 py-2 shadow-lg">
        <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
        <span className="text-xs font-medium text-muted-foreground">AI bot quryapti...</span>
        <span className="flex gap-0.5">
          {[0, 150, 300].map(d => (
            <span key={d} className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${d}ms` }} />
          ))}
        </span>
      </div>
    </div>
  );
}

function ConstructorLoadingSkeletons() {
  return (
    <div className="flex h-screen">
      <div className="w-[420px] border-r p-4 flex flex-col gap-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[60%] w-full" />
        <Skeleton className="h-12 w-full mt-auto" />
      </div>
      <div className="flex-1 grid grid-cols-12 grid-rows-12 gap-4 p-4">
        <Skeleton className="col-span-3 row-span-4 col-start-3 row-start-3" />
        <Skeleton className="col-span-3 col-start-4 row-start-8" />
        <Skeleton className="col-span-3 row-span-3 col-start-8 row-start-4" />
        <Skeleton className="col-span-3 row-span-2 col-start-7 row-start-8" />
      </div>
    </div>
  );
}
