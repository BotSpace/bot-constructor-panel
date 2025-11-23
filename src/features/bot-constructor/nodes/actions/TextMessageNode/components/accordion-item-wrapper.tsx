import React from "react";
import { CollectionDetail, CollectionListItem } from "@/types/http/collection";
import { FilterBuilder } from "./filter/filter";
import { useReactQueryAction } from "@/services/react-query";
import { APIDetailCreateResponse } from "@/types/http/response";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SendTextMessageNodeData } from "../types";
import { Badge } from "@/components/ui/badge";
import TelegramEditor from "@/features/bot-constructor/components/RichTextEditor/editor/TelegramEditor";

type Props = {
  collection: CollectionListItem;
  data: SendTextMessageNodeData;
  id: string;
};

function AccordionItemWrapper({ data, collection, id }: Props) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  // Ma'lumotlarni global store'da yangilash uchun markaziy funksiya
  const handleUpdate = (update: Partial<SendTextMessageNodeData>) => {
    updateNodeData(id, update);
  };

  const { data: fields } = useReactQueryAction<
    APIDetailCreateResponse<CollectionDetail>
  >({
    url: `collection/${collection.name}/?project=[id]`,
  });

  if (!fields) return <Skeleton className="w-full h-10" />;

  // Collection'ga tegishli dynamic message'ni topish
  const currentMessage = data.dynamicMessages?.find(
    (message) => message.collection.id === collection.id
  );

  return (
    <>
      <FilterBuilder
        key={`filter-builder-${collection.id}`}
        fields={fields.data.fields.map((field) => ({
          id: field.id.toString(),
          label: field.name,
          type: field.type,
        }))}
        filters={currentMessage?.filters ?? []}
        onChange={(filters) =>
          handleUpdate({
            dynamicMessages: data.dynamicMessages?.map((message) =>
              message.collection.id === collection.id
                ? { ...message, filters }
                : message
            ),
          })
        }
      />

      <div className="flex gap-2 mt-2">
        {fields.data.fields.map((field) => (
          <Badge key={`badge-${field.id}`} variant="outline">
            ${field.name}
          </Badge>
        ))}
      </div>

      <TelegramEditor
        initialData={currentMessage?.messageText}
        onSave={(editorData) =>
          handleUpdate({
            dynamicMessages: data.dynamicMessages?.map((message) =>
              message.collection.id === collection.id
                ? { ...message, messageText: editorData }
                : message
            ),
          })
        }
        data={data}
      />
    </>
  );
}

export default AccordionItemWrapper;
