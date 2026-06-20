"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CollectionListItem } from "@/types/http/collection";
import AccordionItemWrapper from "@/features/bot-constructor/nodes/bespoke/TextMessageNode/components/accordion-item-wrapper";
import { Badge } from "@/components/ui/badge";
import { Database, Trash2 } from "lucide-react";
import { DynamicMessage } from "@/features/bot-constructor/types/shared-ui-types";

export function DynamicMessageConstructor({
  children,
  id,
  handleUpdate,
  initialDynamicMessages,
}: {
  children: React.ReactNode;
  id: string;
  handleUpdate: ({}) => void;
  initialDynamicMessages?: DynamicMessage[];
}) {
  // New dynamic message name
  const [name, setName] = useState<string>("");
  const [collection, setCollection] = useState<CollectionListItem | null>(null);

  // Bu yerdan olib tashlash kerak agar bu yerda ishlatilinmasa
  const { data: collections } = useCollectionStore();

  const dynamicMessages = initialDynamicMessages ?? [];

  // Reset form after adding message
  const handleAddMessage = () => {
    if (collection && name.trim()) {
      handleUpdate({
        dynamicMessages: [
          ...dynamicMessages,
          {
            name: name.trim(),
            collection: collection,
            filters: [],
            values: [],
            orderBy: "",
            orderDirection: "asc",
            enablePagination: false,
            limit: 10,
            offset: 0,
          },
        ],
      });
      // Reset form
      setName("");
      setCollection(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dynamic Messages</DialogTitle>
          <DialogDescription>
            Create dynamic messages that load data from collections. Use
            variables like ${"{"}name{"}"} in your message text.
          </DialogDescription>
        </DialogHeader>

        {dynamicMessages.length > 0 ? (
          <>
            <Accordion type="single" collapsible className="w-full">
              {dynamicMessages.map((message, index) => (
                <AccordionItem
                  key={message.name}
                  value={message.name}
                  className="border rounded-lg mb-2 px-3"
                >
                  <div className="flex items-center gap-2">
                    <AccordionTrigger className="flex-1 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Database className="h-4 w-4 text-blue-500" />
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="font-mono bg-blue-50 text-blue-700 border-blue-200"
                            >
                              ${message.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              from {message.collection.name}
                            </span>
                          </div>
                          {message.enablePagination && (
                            <span className="text-xs text-muted-foreground mt-1">
                              Pagination: {message.limit} items/page
                            </span>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent className="pt-4">
                    <AccordionItemWrapper
                      dynamicMessages={dynamicMessages}
                      collection={message.collection}
                      id={id}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </>
        ) : (
          <div className="grid gap-2 items-center justify-center py-12 border-2 border-dashed rounded-lg">
            <Database className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-muted-foreground font-medium">
              No dynamic messages
            </p>
            <p className="text-xs text-muted-foreground max-w-xs text-center">
              Add a dynamic message to load data from collections and use it in
              your bot messages
            </p>
          </div>
        )}

        <div className="space-y-3 pt-4 border-t">
          <Label className="text-sm font-medium">Add New Dynamic Message</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Variable name (e.g., films, products)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1"
            />
            <Select
              value={collection?.name ?? ""}
              onValueChange={(value) =>
                setCollection(
                  collections?.find(
                    (collection) => collection.name === value
                  ) ?? null
                )
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                {collections?.map((collection) => (
                  <SelectItem key={collection.id} value={collection.name}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="default"
              onClick={handleAddMessage}
              disabled={!collection || !name.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            After adding, you can use ${"{"}name{"}"} in your message to display
            data from the collection.
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
