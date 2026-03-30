"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { HTTPRequestNodeData, HTTPMethod } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const HTTPRequestNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<HTTPRequestNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const handleUpdate = (update: Partial<HTTPRequestNodeData>) => {
    updateNodeData(id, update);
  };

  return (
    <Card className={cn("w-[150px] h-[150px] shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="🌐"
        title="HTTP So'rov"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          {/* HTTP Method */}
          <div className="flex flex-col gap-2">
            <Label>HTTP Metod</Label>
            <Select
              value={data.method || "GET"}
              onValueChange={(value: HTTPMethod) =>
                handleUpdate({ method: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* URL */}
          <div className="flex flex-col gap-2">
            <Label>URL</Label>
            <Input
              placeholder="https://api.example.com/endpoint"
              value={data.url || ""}
              onChange={(e) => handleUpdate({ url: e.target.value })}
            />
          </div>

          {/* Headers */}
          <div className="flex flex-col gap-2">
            <Label>Headers (JSON)</Label>
            <Textarea
              placeholder='{"Authorization": "Bearer {{token}}"}'
              value={data.headers ? JSON.stringify(data.headers, null, 2) : ""}
              onChange={(e) => {
                try {
                  const headers = JSON.parse(e.target.value);
                  handleUpdate({ headers });
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              rows={3}
            />
          </div>

          {/* Body (for POST, PUT, PATCH) */}
          {data.method && ["POST", "PUT", "PATCH"].includes(data.method) && (
            <div className="flex flex-col gap-2">
              <Label>Body (JSON)</Label>
              <Textarea
                placeholder='{"key": "value", "user_id": "{{user_id}}"}'
                value={data.body || ""}
                onChange={(e) => handleUpdate({ body: e.target.value })}
                rows={4}
              />
            </div>
          )}

          {/* Response Variable */}
          <div className="flex flex-col gap-2">
            <Label>Javob o'zgaruvchisi</Label>
            <Input
              placeholder="response (default: http_response)"
              value={data.responseVariable || ""}
              onChange={(e) =>
                handleUpdate({ responseVariable: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Javob bu o'zgaruvchiga saqlanadi
            </p>
          </div>

          {/* Timeout */}
          <div className="flex flex-col gap-2">
            <Label>Timeout (soniya)</Label>
            <Input
              type="number"
              placeholder="30"
              value={data.timeout || ""}
              onChange={(e) =>
                handleUpdate({ timeout: parseInt(e.target.value) || 30 })
              }
            />
          </div>

          {/* Store Headers */}
          <div className="flex items-center justify-between">
            <Label>Response header'larni saqlash</Label>
            <Switch
              checked={data.storeHeaders || false}
              onCheckedChange={(checked) =>
                handleUpdate({ storeHeaders: checked })
              }
            />
          </div>
        </CardContent>
      )}

      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const HTTPRequestNode = memo(HTTPRequestNodeComponent);
