"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  Smartphone,
  MapPin,
  Navigation,
  Globe,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { ButtonConfig } from "@/features/bot-constructor/panels/ButtonGenerator/types";
import { WebAppForm } from "@/features/bot-constructor/panels/ButtonGenerator/components/WebAppForm";
import { CollectionButtonForm } from "@/features/bot-constructor/panels/ButtonGenerator/components/CollectionButtonForm";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface ReplyFormProps {
  onAdd: (button: ButtonConfig) => void;
  disabled: boolean;
  nodeId: string;
}

type ReplyType =
  | "reply"
  | "web_app"
  | "request_contact"
  | "request_location"
  | "request_live_location"
  | "request_poll";

const replyTypes: {
  value: ReplyType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "reply", label: "Matn", icon: MessageSquare },
  { value: "web_app", label: "Web App", icon: Globe },
  { value: "request_contact", label: "Kontakt", icon: Smartphone },
  { value: "request_location", label: "Joylashuv", icon: MapPin },
  { value: "request_live_location", label: "Jonli joy", icon: Navigation },
  { value: "request_poll", label: "So'rovnoma", icon: BarChart3 },
];

const quickButtons = [
  { emoji: "⬅️", label: "Ortga" },
  { emoji: "➡️", label: "Oldinga" },
  { emoji: "✅", label: "Tasdiqlash" },
  { emoji: "❌", label: "Bekor" },
  { emoji: "🏠", label: "Bosh menyu" },
  { emoji: "📋", label: "Menyu" },
];

export const ReplyForm = ({ onAdd, disabled, nodeId }: ReplyFormProps) => {
  const [text, setText] = useState("");
  const [actionType, setActionType] = useState<ReplyType>("reply");
  const [webAppUrl, setWebAppUrl] = useState("");
  const [pollType, setPollType] = useState<"quiz" | "regular">("regular");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Special types don't need text
    const needsText = actionType === "reply" || actionType === "web_app";
    if (needsText && !text.trim()) return;

    const id = `btn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (actionType === "request_contact") {
      onAdd({ id, text: "📱 Kontaktimni yuborish", type: "request_contact" });
      return;
    }
    if (actionType === "request_location") {
      onAdd({ id, text: "📍 Joylashuvimni yuborish", type: "request_location" });
      return;
    }
    if (actionType === "request_live_location") {
      onAdd({ id, text: "📡 Jonli joylashuv", type: "request_live_location" });
      return;
    }
    if (actionType === "request_poll") {
      onAdd({
        id,
        text: `📊 So'rovnoma (${pollType === "quiz" ? "Viktorina" : "Oddiy"})`,
        type: "request_poll",
        pollType,
      });
      return;
    }

    const newButton: Partial<ButtonConfig> = {
      id: `btn-${Date.now()}`,
      text: text.trim(),
      type: actionType,
    };

    if (actionType === "web_app") {
      if (!webAppUrl || !webAppUrl.startsWith("https://")) return;
      newButton.webApp = { url: webAppUrl };
      newButton.value = webAppUrl;
    }

    onAdd(newButton as ButtonConfig);
    setText("");
    setWebAppUrl("");
  };

  const addQuickButton = (label: string) => {
    onAdd({
      id: `btn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: label,
      type: "reply",
    });
  };

  const isSpecialType = !["reply", "web_app"].includes(actionType);

  return (
    <div className="space-y-5">
      {/* Type selector */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Tugma turi</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {replyTypes.map(({ value: v, label, icon: Icon }) => (
            <button
              key={v}
              type="button"
              onClick={() => setActionType(v)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-[11px] font-medium transition-all",
                actionType === v
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {!isSpecialType && (
          <div>
            <Label htmlFor="reply-text" className="text-xs mb-1.5 block">Tugma matni</Label>
            <Input
              id="reply-text"
              placeholder="Masalan, Asosiy Menyu"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        )}

        {actionType === "web_app" && (
          <div className="animate-in fade-in-50 duration-150">
            <WebAppForm url={webAppUrl} onUrlChange={setWebAppUrl} />
          </div>
        )}

        {actionType === "request_poll" && (
          <div className="animate-in fade-in-50 duration-150">
            <Label className="text-xs mb-1.5 block">So'rovnoma turi</Label>
            <Select
              value={pollType}
              onValueChange={(v: "quiz" | "regular") => setPollType(v)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Oddiy</SelectItem>
                <SelectItem value="quiz">Viktorina (Quiz)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {isSpecialType && actionType !== "request_poll" && (
          <div className="rounded-lg bg-muted/50 border px-3 py-2.5 text-xs text-muted-foreground">
            Bu tugma bosilganda foydalanuvchi{" "}
            {actionType === "request_contact" && "o'z kontakt ma'lumotlarini"}
            {actionType === "request_location" && "joylashuvini"}
            {actionType === "request_live_location" && "jonli joylashuvini"}
            {" "}yuboradi.
          </div>
        )}

        <Button type="submit" className="w-full h-8 text-sm gap-2" disabled={disabled}>
          <PlusCircle className="h-3.5 w-3.5" />
          Reply tugma qo'shish
        </Button>
      </form>

      <Separator />

      {/* Quick buttons */}
      <div>
        <p className="text-xs text-muted-foreground mb-2.5 font-medium">Tezkor tugmalar</p>
        <div className="grid grid-cols-2 gap-1.5">
          {quickButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => addQuickButton(`${btn.emoji} ${btn.label}`)}
              disabled={disabled}
              className="flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-2 text-xs hover:bg-muted transition-colors disabled:opacity-40 text-left"
            >
              <span>{btn.emoji}</span>
              <span className="font-medium">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Collection buttons */}
      <CollectionButtonForm
        onAdd={onAdd}
        buttonType="reply"
        disabled={disabled}
        nodeId={nodeId}
      />
    </div>
  );
};
