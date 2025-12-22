"use client";

import { useState, memo } from "react";
import { NodeProps } from "reactflow";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/features/bot-constructor/store";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { Plus, Trash2 } from "lucide-react";
import { ButtonGenerator } from "@/features/bot-constructor/components/ButtonGenerator/ButtonGenerator";
import { MediaGroupNodeData, MediaItem } from "./types";

const MediaGroupNodeInternal = ({
  id,
  data,
  selected,
}: NodeProps<MediaGroupNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mediaItems = data.mediaItems || [];

  const handleUpdate = (update: Partial<MediaGroupNodeData>) => {
    updateNodeData(id, update);
  };

  const addMediaItem = () => {
    const newItem: MediaItem = {
      type: "photo",
      sourceType: "file_id",
    };
    handleUpdate({ mediaItems: [...mediaItems, newItem] });
  };

  const removeMediaItem = (index: number) => {
    const newItems = mediaItems.filter((_, i) => i !== index);
    handleUpdate({ mediaItems: newItems });
  };

  const updateMediaItem = (index: number, update: Partial<MediaItem>) => {
    const newItems = [...mediaItems];
    newItems[index] = { ...newItems[index], ...update };
    handleUpdate({ mediaItems: newItems });
  };

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="🖼️"
        title="Media guruh yuborish"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Media elementlar (2-10 ta)</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={addMediaItem}
                disabled={mediaItems.length >= 10}
              >
                <Plus className="w-4 h-4 mr-1" />
                Qo'shish
              </Button>
            </div>

            {mediaItems.length === 0 && (
              <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
                Media elementlar yo'q. Qo'shish tugmasini bosing.
              </div>
            )}

            {mediaItems.map((item, index) => (
              <div key={index} className="p-3 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Media #{index + 1}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeMediaItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">Tur</Label>
                    <Select
                      value={item.type}
                      onValueChange={(value: MediaItem["type"]) =>
                        updateMediaItem(index, { type: value })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photo">📷 Rasm</SelectItem>
                        <SelectItem value="video">🎥 Video</SelectItem>
                        <SelectItem value="audio">🎵 Audio</SelectItem>
                        <SelectItem value="document">📄 Fayl</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">Manba</Label>
                    <Select
                      value={item.sourceType}
                      onValueChange={(value: MediaItem["sourceType"]) =>
                        updateMediaItem(index, { sourceType: value })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="file_id">File ID</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {item.sourceType === "file_id" ? (
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">File ID</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder="AgACAgIAAxkBAAIC..."
                      value={item.fileId || ""}
                      onChange={(e) =>
                        updateMediaItem(index, { fileId: e.target.value })
                      }
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs">URL</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder="https://example.com/media.jpg"
                      value={item.url || ""}
                      onChange={(e) =>
                        updateMediaItem(index, { url: e.target.value })
                      }
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label className="text-xs">Tavsif (ixtiyoriy)</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="Media tavsifi..."
                    value={item.caption || ""}
                    onChange={(e) =>
                      updateMediaItem(index, { caption: e.target.value })
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          {mediaItems.length > 0 && mediaItems.length < 2 && (
            <div className="text-xs text-amber-600 p-2 bg-amber-50 dark:bg-amber-950 rounded">
              ⚠️ Kamida 2 ta media element kerak
            </div>
          )}
        </CardContent>
      )}

      <CardFooter>
        <ButtonGenerator initialKeyboard={data.keyboard} node_id={id} />
      </CardFooter>

      <SourceHandles />
    </Card>
  );
};

export const SendMediaGroupNode = memo(MediaGroupNodeInternal);
