"use client";

import { useEffect, useState } from "react"; // Kerakli hook'larni import qilamiz
import Constructor from "@/features/bot-constructor/constructor";
import useProjectStore from "@/features/bot-constructor/store/project";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { DebugConsole } from "@/components/layout/components/debug-console/debug-console";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import { useTranslations } from "next-intl";
import { ReactFlowProvider } from "reactflow";
import SearchPanel from "@/features/bot-constructor/search/search-panel";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { OrientationGuard } from "@/components/common/OrientationGuard";
import BottomPanel from "@/features/bot-constructor/components/bottom-panel";
import { ReleasePanel } from "@/components/layout/components/relas/relas";

export default function Page() {
  const { id }: { id: string } = useParams();

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

  const isMobile = useIsMobile();
  const [isOriented, setIsOriented] = useState(false);

  if (isMobile && !isOriented)
    return <OrientationGuard handleOrientDevice={() => setIsOriented(true)} />;

  if (!project) return <ConstructorLoadingSkeletions />;
  return (
    <main>
      <ReactFlowProvider>
        {/* constructor */}
        <Constructor />

        {/* Widgets */}
        <SearchPanel />
        <DebugConsole />

        <BottomPanel />
      </ReactFlowProvider>
    </main>
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
