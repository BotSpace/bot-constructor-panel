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
import { SendTextMessageNodeData } from "../types";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Input } from "@/components/ui/input";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CollectionListItem } from "@/types/http/collection";
import AccordionItemWrapper from "./accordion-item-wrapper";
import { Badge } from "@/components/ui/badge";

export function DynamicMessageConstructor({
  children,
  data,
  id,
}: {
  children: React.ReactNode;
  data: SendTextMessageNodeData;
  id: string;
}) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  // Ma'lumotlarni global store'da yangilash uchun markaziy funksiya
  const handleUpdate = (update: Partial<SendTextMessageNodeData>) => {
    updateNodeData(id, update);
  };

  // New dynamic message name
  const [name, setName] = useState<string>("");
  const [collection, setCollection] = useState<CollectionListItem | null>(null);

  // TODO: Bu keyinroq ishlatilinadi.
  // Bu yerdan olib tashlash kerak agar bu yerda ishlatilinmasa
  const { data: collections } = useCollectionStore();

  const dynamicMessages = data.dynamicMessages ?? [];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dynamic xabarlar yarating</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        {dynamicMessages.length > 0 ? (
          <>
            <Accordion type="single" collapsible>
              {dynamicMessages.map((message) => (
                <AccordionItem key={message.name} value={message.name}>
                  <AccordionTrigger>${message.name}</AccordionTrigger>
                  <AccordionContent>
                    <AccordionItemWrapper
                      collection={message.collection}
                      data={data}
                      id={id}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </>
        ) : (
          <div className="grid gap-2 items-center justify-center">
            <p>Dynamic xabarlar yo'q</p>
          </div>
        )}

        <div className="grid gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
            />
            <Select
              onValueChange={(value) =>
                setCollection(
                  collections?.find(
                    (collection) => collection.name === value
                  ) ?? null
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Collection" />
              </SelectTrigger>
              <SelectContent>
                {collections?.map((collection) => (
                  <SelectItem key={collection.id} value={collection.name}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              collection &&
              handleUpdate({
                dynamicMessages: [
                  ...dynamicMessages,
                  {
                    name: name,
                    collection: collection,
                    filters: [],
                    values: [],
                    orderBy: "",
                    orderDirection: "asc",
                    limit: 0,
                    offset: 0,
                  },
                ],
              })
            }
          >
            Add dynamic message
          </Button>
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
