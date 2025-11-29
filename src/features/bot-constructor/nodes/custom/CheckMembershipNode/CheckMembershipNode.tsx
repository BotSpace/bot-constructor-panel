"use client";

import { NodeProps } from "reactflow";
import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { NodeFooter } from "../../actions/shared/NodeFooter";
import { TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Handle, Position } from "reactflow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface ChannelInfo {
  id: string;
  value: string;
}

interface CheckMembershipNodeData {
  channels?: ChannelInfo[];
  inputType?: "id" | "username";
}

const CheckMembershipNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CheckMembershipNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<CheckMembershipNodeData>) => {
    updateNodeData(id, update);
  };

  const inputType = data.inputType || "username";
  const channels = data.channels || [];

  const addChannel = () => {
    const newChannels = [
      ...channels,
      { id: `channel_${Date.now()}`, value: "" },
    ];
    handleUpdate({ channels: newChannels });
  };

  const removeChannel = (channelId: string) => {
    const newChannels = channels.filter((ch) => ch.id !== channelId);
    handleUpdate({ channels: newChannels });
  };

  const updateChannel = (channelId: string, value: string) => {
    const newChannels = channels.map((ch) =>
      ch.id === channelId ? { ...ch, value } : ch
    );
    handleUpdate({ channels: newChannels });
  };

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="👥"
        title="A'zolikni tekshirish"
        nodeId={id}
        color="bg-purple-500/10"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label>Kirish turi</Label>
            <Select
              value={inputType}
              onValueChange={(value: "id" | "username") =>
                handleUpdate({ inputType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Kirish turini tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="username">Username (@kanal)</SelectItem>
                <SelectItem value="id">Chat ID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>
                {inputType === "username"
                  ? "Kanal/Guruh Usernamelari"
                  : "Kanal/Guruh Chat IDlari"}
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={addChannel}
                className="h-7"
              >
                <Plus className="w-4 h-4 mr-1" />
                Qo&apos;shish
              </Button>
            </div>

            {channels.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                Kanal yoki guruh qo&apos;shing
              </div>
            )}

            {channels.map((channel) => (
              <div key={channel.id} className="flex gap-2">
                <Input
                  placeholder={
                    inputType === "username"
                      ? "@kanalUsername"
                      : "-100123456789"
                  }
                  value={channel.value}
                  onChange={(e) => updateChannel(channel.id, e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeChannel(channel.id)}
                  className="h-10 w-10 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}

            <p className="text-xs text-muted-foreground">
              {inputType === "username"
                ? "@ belgisi bilan yoki @ belgisisiz kiriting. Foydalanuvchi barcha kanallarga a'zo bo'lishi kerak."
                : "Kanal yoki guruhning Chat ID raqami (odatda - belgisi bilan boshlanadi). Foydalanuvchi barcha kanallarga a'zo bo'lishi kerak."}
            </p>
          </div>

          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 Ushbu node foydalanuvchi barcha ko&apos;rsatilgan kanal yoki
              guruhlar a&apos;zosi ekanligini tekshiradi va 2 ta yo&apos;nalish
              orqali davom etadi:
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 ml-4 list-disc">
              <li>✅ Barcha kanallarga a&apos;zo bo&apos;lsa (is-member)</li>
              <li>
                ❌ Kamida bitta kanalga a&apos;zo bo&apos;lmasa (not-member)
              </li>
            </ul>
          </div>
        </CardContent>
      )}

      <NodeFooter nodeId={id} />

      {/* Conditional Output Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="is-member"
        style={{ top: "40%", background: "#22c55e" }}
        className="!w-3 !h-3"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="not-member"
        style={{ top: "60%", background: "#ef4444" }}
        className="!w-3 !h-3"
      />
    </Card>
  );
};

export const CheckMembershipNode = memo(CheckMembershipNodeComponent);
