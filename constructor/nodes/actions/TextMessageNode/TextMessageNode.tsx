"use client";

import { useState, useCallback } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, Settings, ChevronDown } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface TextMessageNodeData {
  recipientType: "sender" | "manual";
  recipientId: string;
  messageText: string;
  parseMode: "HTML" | "MarkdownV2" | "Markdown";
  isMuted: boolean;
  isMinimized: boolean;
}

// React Flow uchun node component
export function SendTextMessageNode({
  id,
  data,
  selected,
}: NodeProps<TextMessageNodeData>) {
  const [nodeData, setNodeData] = useState<TextMessageNodeData>({
    recipientType: data?.recipientType || "sender",
    recipientId: data?.recipientId || "",
    messageText: data?.messageText || "",
    parseMode: data?.parseMode || "HTML",
    isMuted: data?.isMuted || false,
    isMinimized: data?.isMinimized || false,
  });

  const handleRecipientChange = useCallback((value: string) => {
    setNodeData((prev) => ({ ...prev, recipientId: value }));
  }, []);

  const handleMessageChange = useCallback((value: string) => {
    setNodeData((prev) => ({ ...prev, messageText: value }));
  }, []);

  const handleParseModeChange = useCallback(
    (value: "HTML" | "MarkdownV2" | "Markdown") => {
      setNodeData((prev) => ({ ...prev, parseMode: value }));
    },
    []
  );

  const handleMuteChange = useCallback((checked: boolean) => {
    setNodeData((prev) => ({ ...prev, isMuted: checked }));
  }, []);

  const handleRecipientTypeChange = useCallback(
    (value: "sender" | "manual") => {
      setNodeData((prev) => ({
        ...prev,
        recipientType: value,
        recipientId: value === "sender" ? "" : prev.recipientId,
      }));
    },
    []
  );

  const toggleMinimize = useCallback(() => {
    setNodeData((prev) => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  // Validation
  const isRecipientValid =
    nodeData.recipientType === "sender" ||
    (nodeData.recipientType === "manual" &&
      nodeData.recipientId.trim().length > 0);
  const isMessageValid = nodeData.messageText.trim().length > 0;
  const isNodeValid = isRecipientValid && isMessageValid;

  return (
    <div className="w-80">
      {/* React Flow Handles */}

      <Handle
        type="source"
        position={Position.Top}
        className="w-4 h-4 bg-green-500 border-2 hover:border-green-600 hover:bg-green-400 transition-colors"
      />
      <Card
        className={`shadow-lg border-2 ${
          selected
            ? "border-blue-400 shadow-xl"
            : isNodeValid
            ? "border-green-200"
            : "border-red-200"
        } w-80`}
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center justify-between ${
              isNodeValid ? "text-green-700" : "text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">Matnli Xabar</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="p-1 h-auto"
                title={nodeData.isMinimized ? "Kengaytirish" : "Kichraytirish"}
              >
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transform transition-transform duration-200",
                    nodeData.isMinimized ? "rotate-180" : "rotate-0"
                  )}
                />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        {!nodeData.isMinimized && (
          <CardContent className="space-y-4 pt-4">
            {/* Recipient Type & ID */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                Qabul qiluvchi
                {!isRecipientValid && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </Label>

              <RadioGroup
                value={nodeData.recipientType}
                onValueChange={handleRecipientTypeChange}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sender" id={`sender-${id}`} />
                  <Label
                    htmlFor={`sender-${id}`}
                    className="text-sm cursor-pointer"
                  >
                    Yuboruvchiga qaytarish
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id={`manual-${id}`} />
                  <Label
                    htmlFor={`manual-${id}`}
                    className="text-sm cursor-pointer"
                  >
                    ID qo'lda kiritish
                  </Label>
                </div>
              </RadioGroup>

              {nodeData.recipientType === "manual" && (
                <Input
                  placeholder="@username, user_id yoki chat_id"
                  value={nodeData.recipientId}
                  onChange={(e) => handleRecipientChange(e.target.value)}
                  className={`transition-colors ${
                    isRecipientValid
                      ? "border-green-300 focus:border-green-500"
                      : "border-red-300 focus:border-red-500"
                  }`}
                />
              )}
            </div>

            {/* Message Text */}
            <div className="space-y-2">
              <Label className="flex items-center justify-between text-sm font-medium">
                <span>
                  Xabar matni
                  {!isMessageValid && (
                    <span className="text-red-500 text-xs ml-1">*</span>
                  )}
                </span>
                <span className="text-xs ">
                  {nodeData.messageText.length}/4096
                </span>
              </Label>
              <Textarea
                placeholder="Bu yerga xabar matnini yozing..."
                value={nodeData.messageText}
                onChange={(e) => handleMessageChange(e.target.value)}
                rows={4}
                maxLength={4096}
                className={`transition-colors resize-none ${
                  isMessageValid
                    ? "border-green-300 focus:border-green-500"
                    : "border-red-300 focus:border-red-500"
                }`}
              />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Settings className="w-4 h-4" />
                  Parse Mode
                </Label>
                <Select
                  value={nodeData.parseMode}
                  onValueChange={handleParseModeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HTML">HTML</SelectItem>
                    <SelectItem value="MarkdownV2">Markdown V2</SelectItem>
                    <SelectItem value="Markdown">Markdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Sozlamalar</Label>
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    checked={nodeData.isMuted}
                    onCheckedChange={handleMuteChange}
                  />
                  <Label className="text-sm cursor-pointer">
                    Ovozsiz yuborish
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        )}

        {/* Minimized View */}
        {nodeData.isMinimized && (
          <CardContent className="pt-4 pb-4">
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span className="font-medium">
                  {nodeData.recipientType === "sender" ? (
                    <Badge variant="secondary" className="text-xs">
                      Yuboruvchiga
                    </Badge>
                  ) : (
                    nodeData.recipientId || (
                      <span className=" italic">ID kiritilmagan</span>
                    )
                  )}
                </span>
              </div>
              <div className="text-xs truncate">
                {nodeData.messageText || (
                  <span className="italic">Xabar matni kiritilmagan</span>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Handle
        type="target"
        position={Position.Bottom}
        className="w-4 h-4 bg-blue-500 border-2"
      />
    </div>
  );
}
