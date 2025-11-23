"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CollectionListItem } from "@/types/http/collection";
import { AddNewCollectionModal } from "./add-collection-modal";

interface TableHeaderProps {
  fields: any[];
  collection: CollectionListItem;
  project: string;
  onSuccess?: () => void;
}

export default function TableHeader({
  fields,
  collection,
  project,
  onSuccess,
}: TableHeaderProps) {
  return (
    <thead>
      <tr className="border-b border-border">
        {fields.map((item) => (
          <th
            key={`table-head-${item.id}`}
            className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            {item.name}
          </th>
        ))}

        <th>
          <AddNewCollectionModal
            collection={collection}
            onSuccess={onSuccess ?? (() => {})}
            fields={fields}
            project_id={project}
          >
            <Button size={"icon"} variant={"outline"}>
              <Plus className="h-4 w-4 text-muted-foreground m-4 cursor-pointer" />
            </Button>
          </AddNewCollectionModal>
        </th>
      </tr>
    </thead>
  );
}
