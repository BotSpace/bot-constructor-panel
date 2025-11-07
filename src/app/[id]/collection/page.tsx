"use client";

import { useEffect, useState } from "react";
import Sidebar from "./components/sidebar";
import ContentTable from "./components/content-table";
import { useReactQueryAction } from "@/services/react-query/use-react-query-action";
import { CollectionListItem } from "@/types/http/collection";
import { APIListResponse } from "@/types/http/response";
import { useParams } from "next/navigation";

export default function Home() {
  const { id }: { id: string } = useParams();

  const { data, refetch } = useReactQueryAction<
    APIListResponse<CollectionListItem[]>
  >({
    url: "collection/?project=[id]",
  });

  const [selectedCollection, setSelectedCollection] =
    useState<CollectionListItem>();

  useEffect(() => {
    if (data && data.data.results.length > 0 && !selectedCollection) {
      setSelectedCollection(data.data.results[0]);
    }
  }, [data]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        refetch={refetch}
        collections={data?.data.results || "loading"}
        selectedCollection={selectedCollection}
        onSelectCollection={setSelectedCollection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Table */}
        {selectedCollection && (
          <ContentTable project={id} collection={selectedCollection} />
        )}
      </div>
    </div>
  );
}
