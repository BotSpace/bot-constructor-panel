"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, ChevronDown, Key } from "lucide-react";
import { NodeProps } from "reactflow";
import { DownloadNodeData } from "./types";
import { SourceHandles, TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";

export function DownloadNode({ id, data, selected }: NodeProps<DownloadNodeData>) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { key: e.target.value });
  };

  // Node sozlanganligini tekshirish
  const isConfigured = !!data.key && data.key.trim() !== "";

  return (
    <Card
      className={`w-80 rounded-xl border shadow-lg transition-all overflow-hidden ${
        selected
          ? "border-sky-500/80 shadow-xl shadow-sky-500/10 ring-2 ring-sky-500/20"
          : "border-gray-700/50 shadow-md"
      }`}
    >
      <TargetHandles />

      <CardHeader className="pb-3 px-6 pt-6">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm flex items-center justify-between cursor-pointer group rounded-lg p-2 -m-2 hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1">
            <Download className="h-4 w-4 text-blue-400 flex-shrink-0" />
            <span className="font-medium text-gray-200">Download</span>
            {data.key && (
              <Badge
                variant="secondary"
                className="border-gray-600/50 text-xs px-1.5 py-0"
              >
                {data.key}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                isConfigured
                  ? "bg-green-500 shadow-sm shadow-green-500/50"
                  : "bg-gray-600"
              }`}
              title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
            />
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${
                isExpanded ? "rotate-0" : "-rotate-90"
              }`}
            />
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="px-6 pb-6 pt-0 space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="key"
              className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"
            >
              <Key className="h-3 w-3" />
              State Key
            </Label>
            <Input
              id="key"
              type="text"
              placeholder="Masalan: file_uuid, document_id..."
              value={data.key || ""}
              onChange={handleKeyChange}
              className="w-full bg-gray-800/50 border-gray-600/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Fayl yuklab olingandan keyin UUID shu key'ga saqlanadi. Collection insert qilishda ishlatishingiz mumkin.
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium text-blue-400">ℹ️ Qo'llab-quvvatlanadigan fayl turlari:</p>
            <div className="flex flex-wrap gap-1.5">
              {["Document", "Photo", "Video", "Audio", "Voice", "VideoNote", "Animation", "Sticker"].map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="text-xs px-2 py-0.5 bg-gray-800/50 border-gray-600/50 text-gray-300"
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      )}

      <SourceHandles />
    </Card>
  );
}

