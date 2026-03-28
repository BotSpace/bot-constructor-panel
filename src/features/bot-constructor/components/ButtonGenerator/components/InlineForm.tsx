"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PlusCircle,
  Link,
  Code2,
  Globe,
  LogIn,
  Search,
  MessageSquare,
} from "lucide-react";
import { ButtonConfig, LoginUrlConfig } from "../types";
import { WebAppForm } from "./WebAppForm";
import { LoginUrlForm } from "./LoginUrlForm";
import { CollectionButtonForm } from "./CollectionButtonForm";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/features/bot-constructor/store";
import { getAvailableStateKeys } from "@/features/bot-constructor/utils";
import { Separator } from "@/components/ui/separator";

interface InlineFormProps {
  onAdd: (button: ButtonConfig) => void;
  disabled: boolean;
  nodeId: string;
}

type InlineType =
  | "url"
  | "callback"
  | "web_app"
  | "login_url"
  | "switch_inline_query"
  | "switch_inline_query_current_chat";

const inlineTypes: {
  value: InlineType;
  label: string;
  icon: React.ElementType;
  placeholder?: string;
}[] = [
  { value: "callback", label: "Callback", icon: Code2, placeholder: "buyruq_nomi" },
  { value: "url", label: "URL", icon: Link, placeholder: "https://example.com" },
  { value: "web_app", label: "Web App", icon: Globe },
  { value: "login_url", label: "Login URL", icon: LogIn },
  { value: "switch_inline_query", label: "Inline (Global)", icon: Search, placeholder: "so'rov..." },
  { value: "switch_inline_query_current_chat", label: "Inline (Chat)", icon: MessageSquare, placeholder: "so'rov..." },
];

const quickButtons = [
  { emoji: "⬅️", label: "Ortga", value: "back" },
  { emoji: "➡️", label: "Oldinga", value: "next" },
  { emoji: "⏭", label: "O'tkazish", value: "skip" },
  { emoji: "✅", label: "Tasdiqlash", value: "confirm" },
  { emoji: "❌", label: "Bekor", value: "cancel" },
  { emoji: "🏠", label: "Bosh menyu", value: "main_menu" },
];

export const InlineForm = ({ onAdd, disabled, nodeId }: InlineFormProps) => {
  const [text, setText] = useState("");
  const [actionType, setActionType] = useState<InlineType>("callback");
  const [value, setValue] = useState("");
  const [loginConfig, setLoginConfig] = useState<Partial<LoginUrlConfig>>({});
  const [webAppUrl, setWebAppUrl] = useState("");

  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const availableStateKeys = useMemo(
    () => getAvailableStateKeys(nodes, edges, nodeId),
    [nodes, edges, nodeId]
  );

  const selectedType = inlineTypes.find((t) => t.value === actionType)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newButton: Partial<ButtonConfig> = {
      id: `btn-${Date.now()}`,
      text: text.trim(),
      type: actionType,
    };

    if (actionType === "login_url") {
      if (!loginConfig.url) return;
      newButton.loginUrl = loginConfig as LoginUrlConfig;
    } else if (actionType === "web_app") {
      if (!webAppUrl) return;
      newButton.webApp = { url: webAppUrl };
    } else {
      if (!value.trim()) return;
      newButton.value = value.trim();
    }

    onAdd(newButton as ButtonConfig);
    setText("");
    setValue("");
    setLoginConfig({});
    setWebAppUrl("");
  };

  const addQuickButton = (label: string, val: string) => {
    onAdd({
      id: `btn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: label,
      type: "callback",
      value: val,
    });
  };

  return (
    <div className="space-y-5">
      {/* Type selector */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Tugma turi</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {inlineTypes.map(({ value: v, label, icon: Icon }) => (
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
        <div>
          <Label htmlFor="inline-text" className="text-xs mb-1.5 block">Tugma matni</Label>
          <Input
            id="inline-text"
            placeholder="Masalan, Saytimiz"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        <div className="animate-in fade-in-50 duration-150">
          {actionType === "login_url" && (
            <LoginUrlForm config={loginConfig} onConfigChange={setLoginConfig} />
          )}
          {actionType === "web_app" && (
            <WebAppForm url={webAppUrl} onUrlChange={setWebAppUrl} />
          )}
          {actionType !== "login_url" && actionType !== "web_app" && (
            <div>
              <Label htmlFor="inline-value" className="text-xs mb-1.5 block">
                {selectedType.label} qiymati
              </Label>
              <Input
                id="inline-value"
                placeholder={selectedType.placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          )}
        </div>

        <Button type="submit" className="w-full h-8 text-sm gap-2" disabled={disabled}>
          <PlusCircle className="h-3.5 w-3.5" />
          Inline tugma qo'shish
        </Button>
      </form>

      <Separator />

      {/* Quick buttons */}
      <div>
        <p className="text-xs text-muted-foreground mb-2.5 font-medium">Tezkor tugmalar</p>
        <div className="grid grid-cols-2 gap-1.5">
          {quickButtons.map((btn) => (
            <button
              key={btn.value}
              type="button"
              onClick={() => addQuickButton(`${btn.emoji} ${btn.label}`, btn.value)}
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
        buttonType="inline"
        disabled={disabled}
        nodeId={nodeId}
      />
    </div>
  );
};
