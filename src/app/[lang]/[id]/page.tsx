"use client";

import { useEffect, useState, Suspense } from "react";
import Constructor from "@/features/bot-constructor/constructor";
import useProjectStore from "@/features/bot-constructor/store/project";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { DebugConsole } from "@/components/layout/debug-console/debug-console";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import { ReactFlowProvider } from "reactflow";
import SearchPanel from "@/features/bot-constructor/panels/search/search-panel";
import { useIsMobile } from "@/hooks/use-is-mobile";
import BottomPanel from "@/features/bot-constructor/panels/bottom-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLinkToParent } from "@/components/common/link-to-parrent";
import { SaveStatusBadge } from "@/features/bot-constructor/panels/save-status-badge";
import { Separator } from "@/components/ui/separator";
import { NodeEditDialog } from "@/features/bot-constructor/panels/NodeEditPanel";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConstructorGuide } from "@/features/bot-constructor/components/ConstructorGuide";

function PageInner() {
  const { id }: { id: string } = useParams();
  const { loadProject, project } = useProjectStore();
  const { loadCollections } = useCollectionStore();
  const [addNodeOpen, setAddNodeOpen] = useState(false);

  useEffect(() => {
    if (project) {
      document.title = `${project.name} | BotSpace.uz`;
    }
  }, [project]);

  useEffect(() => {
    loadProject(id);
    loadCollections(id);
  }, [id, loadCollections, loadProject]);

  const isMobile = useIsMobile();

  if (!project) return <ConstructorLoadingSkeletons isMobile={isMobile} />;

  // ── Mobile ─────────────────────────────────────────────────────────────────
  if (isMobile) {
    return <MobileView id={id} project={project} />;
  }

  // ── Desktop ─────────────────────────────────────────────────────────────────
  return (
    <main className="flex flex-col h-screen overflow-hidden bg-background">
      {/* ── N8n-style top bar ─────────────────────────────────── */}
      <N8nTopBar
        project={project}
        id={id}
        onAddNode={() => setAddNodeOpen(true)}
      />

      {/* ── Content row ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Canvas */}
        <div data-tour="constructor-canvas" className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          <ReactFlowProvider>
            <Constructor />
            <SearchPanel />
            <DebugConsole />
            <NodeEditDialog />
            <BottomPanel
              addNodeOpen={addNodeOpen}
              onAddNodeOpenChange={setAddNodeOpen}
            />
          </ReactFlowProvider>
        </div>
      </div>
    </main>
  );
}

// ── N8n-style top bar ─────────────────────────────────────────────────────────
function N8nTopBar({
  project,
  id,
  onAddNode,
}: {
  project: { name: string };
  id: string;
  onAddNode: () => void;
}) {
  const t = useTranslations("editor.topBar");
  const { lang } = useParams<{ lang: string }>();
  const { handleClick: backToHome } = useLinkToParent({ href: `/${lang}/app/bots/${id}` });

  return (
    <div className="h-[62px] shrink-0 flex items-center gap-2 px-3 border-b border-border z-10" style={{ backgroundColor: "#212121" }}>
      {/* Back */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-white/70 hover:text-white hover:bg-white/10"
        onClick={backToHome}
        title={t("back")}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-0.5 bg-white/20" />

      {/* Project name */}
      <span className="min-w-0 truncate text-sm font-semibold text-white">
        {project.name}
      </span>

      {/* Save status */}
      <span data-tour="constructor-save"><SaveStatusBadge /></span>

      <div className="flex-1" />

      {/* Add node — n8n style */}
      <Button
        variant="default"
        size="sm"
        className="h-9 shrink-0 gap-1.5 text-sm px-4"
        onClick={onAddNode}
        title={t("addNodeTitle")}
        data-tour="constructor-add-node"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">{t("addNode")}</span>
      </Button>
      <ConstructorGuide />

      <Separator orientation="vertical" className="h-6 mx-0.5 bg-white/20" />
    </div>
  );
}

// ── Mobile View ────────────────────────────────────────────────────────────
function MobileView({
  id,
  project,
}: {
  id: string;
  project: { name: string };
}) {
  const t = useTranslations("editor.topBar");
  const { lang } = useParams<{ lang: string }>();
  const { handleClick: backToHome } = useLinkToParent({ href: `/${lang}/app/bots/${id}` });

  return (
    <div
      className="flex flex-col h-[100dvh] bg-background overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* ── Top bar — same clean desktop style (no run/publish clutter) ── */}
      <div
        className="h-[62px] shrink-0 flex items-center gap-2 px-3 border-b border-border z-10"
        style={{ backgroundColor: "#212121" }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-white/70 hover:text-white hover:bg-white/10"
          onClick={backToHome}
          title={t("back")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-0.5 bg-white/20" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
          {project.name}
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <ReactFlowProvider>
          <Constructor />
          <SearchPanel />
          <DebugConsole />
          <NodeEditDialog />
        </ReactFlowProvider>
      </div>
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
