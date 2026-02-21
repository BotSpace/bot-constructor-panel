"use client";

import { useEffect, useMemo, useRef, useState } from "react"; // Kerakli hook'larni import qilamiz
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Constructor from "@/features/bot-constructor/constructor";
import { useElements } from "@/features/bot-constructor/data/useElements";
import useProjectStore from "@/features/bot-constructor/store/project";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ConstructorPageHeader } from "@/components/layout/header";
import { DebugConsole } from "@/components/layout/components/debug-console";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import { useTranslations } from "next-intl";
import { ReactFlowProvider } from "reactflow";
import SearchPanel from "@/features/bot-constructor/search/search-panel";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { OrientationGuard } from "@/components/common/OrientationGuard";
import { TourWelcomeModal } from "@/features/bot-constructor/guide-tour/tour-welcome";
import Panel from "@/features/bot-constructor/panel/pane";

export default function Page() {
  const { id }: { id: string } = useParams();
  const t = useTranslations();

  const { loadProject, project } = useProjectStore();
  const { loadCollections } = useCollectionStore();

  // Write title
  useEffect(() => {
    if (project) {
      document.title = `${project.name} | BotMother.uz`;
    }
  }, [project?.id]);

  useEffect(() => {
    // loading project
    loadProject(id);

    // Load project collection
    loadCollections(id);
  }, []);

  // 1. Qidiruv matnini saqlash uchun state
  const [searchTerm, setSearchTerm] = useState("");

  const isMobile = useIsMobile();
  const [isOriented, setIsOriented] = useState(false);

  if (isMobile && !isOriented)
    return <OrientationGuard handleOrientDevice={() => setIsOriented(true)} />;
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <ConstructorPageHeader />

      <TourWelcomeModal />

      <div className="flex">
        {/* Components Panel */}
        <Panel />

        {project ? (
          <main className="grid grid-cols-12 relative w-full">
            <ReactFlowProvider>
              {/* constructor */}
              <Constructor />
              <SearchPanel />
              <DebugConsole />
            </ReactFlowProvider>
          </main>
        ) : (
          <ConstructorLoadingSkeletions />
        )}
      </div>
    </div>
  );
}

function ConstructorLoadingSkeletions() {
  return (
    <div className="w-full h-[calc(100vh-56px)]  grid grid-cols-12 grid-rows-12 gap-4">
      <Skeleton className="col-span-3 row-span-4 col-start-3 row-start-3"></Skeleton>
      <Skeleton className="col-span-3 col-start-4 row-start-8"></Skeleton>
      <Skeleton className="col-span-3 row-span-3 col-start-8 row-start-4"></Skeleton>
      <Skeleton className="col-span-3 row-span-2 col-start-7 row-start-8"></Skeleton>
      <Skeleton className="col-span-3 col-start-3 row-start-10"></Skeleton>
    </div>
  );
}
