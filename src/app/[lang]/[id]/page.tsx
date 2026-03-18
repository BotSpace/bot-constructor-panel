"use client";

import { useEffect, useState } from "react";
import Constructor from "@/features/bot-constructor/constructor";
import useProjectStore from "@/features/bot-constructor/store/project";
import { useParams } from "next/navigation";
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

export default function Page() {
  const { id }: { id: string } = useParams();
  const { loadProject, project } = useProjectStore();
  const { loadCollections } = useCollectionStore();
  const [aiOpen, setAiOpen] = useState(true);

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
          aiOpen ? "w-[360px] border-r border-border" : "w-0 border-0"
        )}
      >
        {aiOpen && (
          <AgentPanel
            projectId={id}
            onCollapse={() => setAiOpen(false)}
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

function ConstructorLoadingSkeletons() {
  return (
    <div className="flex h-screen">
      <div className="w-[360px] border-r p-4 flex flex-col gap-3">
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
