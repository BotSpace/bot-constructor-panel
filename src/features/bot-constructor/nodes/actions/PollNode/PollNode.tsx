"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SendPollNodeData, PollOption } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";
import { ActionPanel } from "../../components/shared/ActionPanel";

const PollNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendPollNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const handleUpdate = (update: Partial<SendPollNodeData>) => {
    updateNodeData(id, update);
  };

  const addOption = () => {
    const newOption: PollOption = { text: "" };
    handleUpdate({
      options: [...(data.options || []), newOption],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = [...(data.options || [])];
    newOptions.splice(index, 1);
    handleUpdate({ options: newOptions });
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...(data.options || [])];
    newOptions[index] = { text };
    handleUpdate({ options: newOptions });
  };

  return (
    <Card className={cn("w-[150px] h-[150px] shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="📊"
        title="So'rovnoma"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          {/* Question */}
          <div className="flex flex-col gap-2">
            <Label>Savol</Label>
            <Input
              placeholder="Sevimli rangingiz qaysi?"
              value={data.question || ""}
              onChange={(e) => handleUpdate({ question: e.target.value })}
            />
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Variantlar</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={addOption}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                Qo'shish
              </Button>
            </div>

            {(data.options || []).map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Variant ${index + 1}`}
                  value={option.text}
                  onChange={(e) => updateOption(index, e.target.value)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeOption(index)}
                  className="px-2"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {/* Type */}
          <div className="flex flex-col gap-2">
            <Label>Turi</Label>
            <Select
              value={data.type || "regular"}
              onValueChange={(value: "regular" | "quiz") =>
                handleUpdate({ type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Oddiy so'rovnoma</SelectItem>
                <SelectItem value="quiz">Test/Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quiz specific */}
          {data.type === "quiz" && (
            <>
              <div className="flex flex-col gap-2">
                <Label>To'g'ri javob (indeks)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.correctOptionId ?? ""}
                  onChange={(e) =>
                    handleUpdate({
                      correctOptionId: parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  0 - birinchi variant, 1 - ikkinchi va h.k.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Tushuntirish (ixtiyoriy)</Label>
                <Textarea
                  placeholder="To'g'ri javob haqida tushuntirish..."
                  value={data.explanation || ""}
                  onChange={(e) =>
                    handleUpdate({ explanation: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </>
          )}

          {/* Settings */}
          <div className="flex items-center justify-between">
            <Label>Anonim</Label>
            <Switch
              checked={data.isAnonymous ?? true}
              onCheckedChange={(checked) =>
                handleUpdate({ isAnonymous: checked })
              }
            />
          </div>

          {data.type !== "quiz" && (
            <div className="flex items-center justify-between">
              <Label>Bir nechta javob</Label>
              <Switch
                checked={data.allowsMultipleAnswers || false}
                onCheckedChange={(checked) =>
                  handleUpdate({ allowsMultipleAnswers: checked })
                }
              />
            </div>
          )}

          {/* Auto close */}
          <div className="flex flex-col gap-2">
            <Label>Avtomatik yopish (soniya, ixtiyoriy)</Label>
            <Input
              type="number"
              placeholder="60"
              value={data.openPeriod || ""}
              onChange={(e) =>
                handleUpdate({ openPeriod: parseInt(e.target.value) })
              }
            />
          </div>
        </CardContent>
      )}

      {!isCollapsed && (
        <CardFooter className="flex flex-col gap-2">
          <ActionPanel keyboard={data.keyboard} id={id} recipients={data.recipients ?? { sendToSender: true, additionalIds: [] }} />
        </CardFooter>
      )}

      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const SendPollNode = memo(PollNodeComponent);
