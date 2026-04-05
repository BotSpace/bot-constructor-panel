import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { cn } from "@/lib/utils";
import { SourceHandles, TargetHandles } from "../../components";
import AddItemModal from "./components/add-item-modal";
import { NodeProps } from "reactflow";
import { FormNodeData } from "./types";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { FormItem } from "./components/form-item";

export function FormNode({ data, id, selected }: NodeProps<FormNodeData>) {
  console.log("🚀 ~ FormNode ~ data:", data);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();
  const [editingItem, setEditingItem] = useState<
    FormNodeData["items"][0] | null
  >(null);

  const handleUpdate = (update: Partial<FormNodeData>) => {
    updateNodeData(id, update);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort items by order before displaying
  const sortedItems = [...data.items].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    return orderA - orderB;
  });

  function handleAddItem(item: FormNodeData["items"][0]) {
    const maxOrder = Math.max(...data.items.map((i) => i.order ?? 0), -1);
    const newItem = {
      ...item,
      order: maxOrder + 1,
    };
    handleUpdate({
      items: [...data.items, newItem],
    });
  }

  function handleRemoveItem(index: number) {
    const newItems = sortedItems.filter((_, i) => i !== index);
    // Recalculate orders
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx,
    }));
    handleUpdate({
      items: reorderedItems,
    });
  }

  function handleEditItem(item: FormNodeData["items"][0]) {
    const updatedItems = data.items.map((existingItem) => {
      if (existingItem.order === editingItem?.order) {
        return item;
      }
      return existingItem;
    });
    handleUpdate({
      items: updatedItems,
    });
    setEditingItem(null);
  }

  function handleStartEdit(index: number) {
    setEditingItem(sortedItems[index]);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = parseInt(active.id.toString().replace("form-item-", ""));
    const newIndex = parseInt(over.id.toString().replace("form-item-", ""));

    if (oldIndex !== newIndex && !isNaN(oldIndex) && !isNaN(newIndex)) {
      const reorderedItems = arrayMove(sortedItems, oldIndex, newIndex);
      // Update orders
      const itemsWithOrders = reorderedItems.map((item, idx) => ({
        ...item,
        order: idx,
      }));
      handleUpdate({
        items: itemsWithOrders,
      });
    }
  }

  const sortableIds = sortedItems.map((_, index) => `form-item-${index}`);

  return (
    <Card className={cn("w-[150px] shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader icon="📝" title="Form" isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        color="bg-amber-500"
      />
      {!isCollapsed && (
        <CardContent className="space-y-3 pt-4">
          {sortedItems.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 nodrag">
                  {sortedItems.map((item, index) => (
                    <FormItem
                      key={`form-item-${index}`}
                      item={item}
                      index={index}
                      onRemove={() => handleRemoveItem(index)}
                      onEdit={() => handleStartEdit(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <AddItemModal
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            editingItem={editingItem}
            onClose={() => setEditingItem(null)}
          />
        </CardContent>
      )}
      <SourceHandles nodeId={id} />
    </Card>
  );
}
