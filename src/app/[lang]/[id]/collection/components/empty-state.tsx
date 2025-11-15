"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddNewCollectionModal } from "./add-collection-modal";
import { CollectionListItem } from "@/types/http/collection";

interface EmptyStateProps {
  collection: CollectionListItem;
  project: string;
  onSuccess?: () => void;
}

export default function EmptyState({
  collection,
  project,
  onSuccess,
}: EmptyStateProps) {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Card className="p-4 hover:shadow-lg cursor-pointer flex items-center justify-center">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <h2 className="text-lg font-semibold mb-2">Yangi Field Yaratish</h2>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Yangi field qo'shish uchun quyidagi tugmani bosing va ma'lumotlarni
            kiriting.
          </p>

          <AddNewCollectionModal
            collection={collection}
            onSuccess={onSuccess ?? (() => {})}
            fields={[]}
            project_id={project}
          >
            <Button className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Field Qo'shish</span>
            </Button>
          </AddNewCollectionModal>
        </CardContent>
      </Card>
    </div>
  );
}
