"use client";

import CollectionModal from "./collection-modal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionListItem } from "@/types/http/collection";

interface SidebarProps {
  selectedCollection?: CollectionListItem;
  onSelectCollection: (collection: CollectionListItem) => void;
  collections: CollectionListItem[] | "loading";
  refetch: () => void;
}

export default function Sidebar({
  selectedCollection,
  onSelectCollection,
  collections,
  refetch,
}: SidebarProps) {
  return (
    <div className="w-56 border-r">
      {/* Collections */}
      <ScrollArea className="flex-1 p-4">
        <div className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Collections
        </div>

        {collections === "loading" ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, idx) => (
              <Skeleton className="rounded-md h-8" key={idx} />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            Collectionlar yo'q
          </div>
        ) : (
          <div className="space-y-2">
            {collections.map((collection) => (
              <Button
                key={collection.id}
                variant={
                  selectedCollection?.id === collection.id
                    ? "default"
                    : "outline"
                }
                className="w-full justify-between"
                onClick={() => onSelectCollection(collection)}
              >
                {collection.name}
                <span className="text-xs opacity-60">{1}</span>
              </Button>
            ))}
          </div>
        )}
        <Separator className="w-full my-2" />

        <CollectionModal refetch={refetch} />

        {/* Add Collection Modal */}
      </ScrollArea>

      {/* Footer */}
      <Separator />
      <div className="p-4">
        <Button variant="link" className="text-xs text-muted-foreground">
          Watch Tutorials
        </Button>
      </div>
    </div>
  );
}
