"use client";

import type React from "react";

import { useState, useCallback } from "react";
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
import {
  MessageSquare,
  User,
  Settings,
  Trash2,
  Move,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TextMessageNodeData {
  id: string;
  recipientType: "sender" | "manual"; // Yangi field
  recipientId: string;
  messageText: string;
  parseMode: "HTML" | "MarkdownV2" | "Markdown";
  isMuted: boolean;
  position: { x: number; y: number };
  isMinimized: boolean;
}

interface TextMessageNodeProps {
  data: TextMessageNodeData;
  onUpdate: (id: string, data: Partial<TextMessageNodeData>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function TextMessageNode({
  data,
  onUpdate,
  onDelete,
  onDuplicate,
  isSelected,
  onSelect,
}: TextMessageNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleRecipientChange = useCallback(
    (value: string) => {
      onUpdate(data.id, { recipientId: value });
    },
    [data.id, onUpdate]
  );

  const handleMessageChange = useCallback(
    (value: string) => {
      onUpdate(data.id, { messageText: value });
    },
    [data.id, onUpdate]
  );

  const handleParseModeChange = useCallback(
    (value: "HTML" | "MarkdownV2" | "Markdown") => {
      onUpdate(data.id, { parseMode: value });
    },
    [data.id, onUpdate]
  );

  const handleMuteChange = useCallback(
    (checked: boolean) => {
      onUpdate(data.id, { isMuted: checked });
    },
    [data.id, onUpdate]
  );

  const toggleMinimize = useCallback(() => {
    onUpdate(data.id, { isMinimized: !data.isMinimized });
  }, [data.id, data.isMinimized, onUpdate]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest(".drag-handle")) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - data.position.x,
          y: e.clientY - data.position.y,
        });
        onSelect(data.id);
      }
    },
    [data.position, data.id, onSelect]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        onUpdate(data.id, {
          position: {
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
          },
        });
      }
    },
    [isDragging, dragStart, data.id, onUpdate]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleRecipientTypeChange = useCallback(
    (value: "sender" | "manual") => {
      onUpdate(data.id, {
        recipientType: value,
        recipientId: value === "sender" ? "" : data.recipientId,
      });
    },
    [data.id, data.recipientId, onUpdate]
  );

  // Validation states
  const isRecipientValid =
    data.recipientType === "sender" ||
    (data.recipientType === "manual" && data.recipientId.trim().length > 0);
  const isMessageValid = data.messageText.trim().length > 0;
  const isNodeValid = isRecipientValid && isMessageValid;

  return (
    <div
      className={`absolute ${
        data.isMinimized ? "min-w-[280px]" : "min-w-[380px]"
      } cursor-move ${isSelected ? "z-10" : "z-0"}`}
      style={{
        left: data.position.x,
        top: data.position.y,
        transform: isDragging ? "scale(1.02)" : "scale(1)",
        transition: isDragging ? "none" : "transform 0.2s ease",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Connection Points */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg hover:bg-blue-600 transition-colors"></div>
      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg hover:bg-green-600 transition-colors"></div>

      <Card
        className={`shadow-lg border-2 ${
          isSelected
            ? "border-blue-400 shadow-xl"
            : isNodeValid
            ? "border-green-200"
            : "border-red-200"
        } bg-white transition-all duration-200`}
      >
        <CardHeader
          className={`pb-3 ${
            isNodeValid
              ? "bg-gradient-to-r from-green-50 to-emerald-50"
              : "bg-gradient-to-r from-red-50 to-pink-50"
          }`}
        >
          <CardTitle
            className={`flex items-center justify-between ${
              isNodeValid ? "text-green-700" : "text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">Matnli Xabar</span>
              <Badge
                variant={isNodeValid ? "default" : "destructive"}
                className="text-xs"
              >
                #{data.id}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="p-1 h-auto hover:bg-white/50"
                title={data.isMinimized ? "Kengaytirish" : "Kichraytirish"}
              >
                {data.isMinimized ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(data.id)}
                className="p-1 h-auto hover:bg-blue-100"
                title="Nusxalash"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <div
                className="drag-handle cursor-move p-1 hover:bg-white/50 rounded"
                title="Ko'chirish"
              >
                <Move className="w-4 h-4" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(data.id)}
                className="p-1 h-auto hover:bg-red-100 hover:text-red-600"
                title="O'chirish"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        {!data.isMinimized && (
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
                value={data.recipientType}
                onValueChange={handleRecipientTypeChange}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sender" id={`sender-${data.id}`} />
                  <Label
                    htmlFor={`sender-${data.id}`}
                    className="text-sm cursor-pointer"
                  >
                    Yuboruvchiga qaytarish
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id={`manual-${data.id}`} />
                  <Label
                    htmlFor={`manual-${data.id}`}
                    className="text-sm cursor-pointer"
                  >
                    ID qo'lda kiritish
                  </Label>
                </div>
              </RadioGroup>

              {data.recipientType === "manual" && (
                <Input
                  id={`recipient-${data.id}`}
                  placeholder="@username, user_id yoki chat_id"
                  value={data.recipientId}
                  onChange={(e) => handleRecipientChange(e.target.value)}
                  className={`transition-colors ${
                    isRecipientValid
                      ? "border-green-300 focus:border-green-500"
                      : "border-red-300 focus:border-red-500"
                  }`}
                />
              )}

              {data.recipientType === "manual" &&
                data.recipientId &&
                !isRecipientValid && (
                  <p className="text-xs text-red-500">
                    Qabul qiluvchi ID kiritilishi shart
                  </p>
                )}
            </div>

            {/* Message Text */}
            <div className="space-y-2">
              <Label
                htmlFor={`message-${data.id}`}
                className="flex items-center justify-between text-sm font-medium"
              >
                <span>
                  Xabar matni
                  {!isMessageValid && (
                    <span className="text-red-500 text-xs ml-1">*</span>
                  )}
                </span>
                <span className="text-xs text-gray-500">
                  {data.messageText.length}/4096
                </span>
              </Label>
              <Textarea
                id={`message-${data.id}`}
                placeholder="Bu yerga xabar matnini yozing..."
                value={data.messageText}
                onChange={(e) => handleMessageChange(e.target.value)}
                rows={4}
                maxLength={4096}
                className={`transition-colors resize-none ${
                  isMessageValid
                    ? "border-green-300 focus:border-green-500"
                    : "border-red-300 focus:border-red-500"
                }`}
              />
              {data.messageText && !isMessageValid && (
                <p className="text-xs text-red-500">
                  Xabar matni kiritilishi shart
                </p>
              )}
            </div>

            {/* Settings Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Parse Mode */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Settings className="w-4 h-4" />
                  Parse Mode
                </Label>
                <Select
                  value={data.parseMode}
                  onValueChange={handleParseModeChange}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HTML">HTML</SelectItem>
                    <SelectItem value="MarkdownV2">Markdown V2</SelectItem>
                    <SelectItem value="Markdown">Markdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mute Option */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sozlamalar</Label>
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    id={`mute-${data.id}`}
                    checked={data.isMuted}
                    onCheckedChange={handleMuteChange}
                    className="border-gray-300"
                  />
                  <Label
                    htmlFor={`mute-${data.id}`}
                    className="text-sm cursor-pointer"
                  >
                    Ovozsiz yuborish
                  </Label>
                </div>
              </div>
            </div>

            {/* Preview */}
            {data.messageText && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Ko'rinish:
                </div>
                <div className="text-sm text-gray-800 whitespace-pre-wrap break-words max-h-20 overflow-y-auto">
                  {data.messageText.length > 100
                    ? `${data.messageText.substring(0, 100)}...`
                    : data.messageText}
                </div>
              </div>
            )}
          </CardContent>
        )}

        {/* Minimized View */}
        {data.isMinimized && (
          <CardContent className="pt-4 pb-4">
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span className="font-medium">
                  {data.recipientType === "sender" ? (
                    <Badge variant="secondary" className="text-xs">
                      Yuboruvchiga
                    </Badge>
                  ) : (
                    data.recipientId || (
                      <span className="text-gray-400 italic">
                        ID kiritilmagan
                      </span>
                    )
                  )}
                </span>
              </div>
              <div className="text-xs text-gray-600 truncate">
                {data.messageText || (
                  <span className="italic">Xabar matni kiritilmagan</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="text-xs">
                  {data.parseMode}
                </Badge>
                {data.isMuted && (
                  <Badge variant="secondary" className="text-xs">
                    Mute
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
