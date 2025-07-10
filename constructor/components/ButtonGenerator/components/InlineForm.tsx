// FAYL: constructor/components/ButtonGenerator/components/InlineForm.tsx (YANGILANGAN)
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
import { PlusCircle } from "lucide-react";
import { ButtonConfig, ButtonType, LoginUrlConfig } from "../types";
import { WebAppForm } from "./WebAppForm";
import { LoginUrlForm } from "./LoginUrlForm";

interface InlineFormProps {
  onAdd: (button: ButtonConfig) => void;
  disabled: boolean;
}

type InlineType =
  | "url"
  | "callback"
  | "web_app"
  | "login_url"
  | "switch_inline_query"
  | "switch_inline_query_current_chat";

const inlineOptions: {
  value: InlineType;
  label: string;
  placeholder?: string;
}[] = [
  { value: "callback", label: "Callback Data", placeholder: "buyruq_nomi" },
  { value: "url", label: "URL (Havola)", placeholder: "https://example.com" },
  { value: "web_app", label: "Web App" },
  { value: "login_url", label: "Login URL" },
  {
    value: "switch_inline_query",
    label: "Switch Inline (Global)",
    placeholder: "qidiruv so`rovi...",
  },
  {
    value: "switch_inline_query_current_chat",
    label: "Switch Inline (Hozirgi chat)",
    placeholder: "qidiruv so`rovi...",
  },
];

export const InlineForm = ({ onAdd, disabled }: InlineFormProps) => {
  const [text, setText] = useState("");
  const [actionType, setActionType] = useState<InlineType>("callback");
  const [value, setValue] = useState("");
  const [loginConfig, setLoginConfig] = useState<Partial<LoginUrlConfig>>({});
  const [webAppUrl, setWebAppUrl] = useState("");

  const handleAddClick = () => {
    if (!text) {
      alert("Iltimos, tugma matnini kiriting.");
      return;
    }

    const newButton: Partial<ButtonConfig> = {
      id: `btn-${Date.now()}`,
      text,
      type: actionType,
    };

    switch (actionType) {
      case "login_url":
        if (!loginConfig.url) {
          alert("Login URL manzilini kiriting.");
          return;
        }
        newButton.loginUrl = loginConfig as LoginUrlConfig;
        break;
      case "web_app":
        if (!webAppUrl) {
          alert("Web App URL manzilini kiriting.");
          return;
        }
        newButton.webApp = { url: webAppUrl };
        break;
      default: // url, callback, switch_*
        if (!value) {
          alert("Iltimos, amal uchun qiymat kiriting.");
          return;
        }
        newButton.value = value;
        break;
    }

    onAdd(newButton as ButtonConfig);
    // Formalarni tozalash
    setText("");
    setValue("");
    setLoginConfig({});
    setWebAppUrl("");
  };

  const selectedOption = inlineOptions.find((opt) => opt.value === actionType);

  return (
    <div className="mt-4 space-y-4">
      <div>
        <Label htmlFor="inline-text">Tugma matni</Label>
        <Input
          id="inline-text"
          placeholder="Masalan, Bizning sayt"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div>
        <Label>Amal turi</Label>
        <Select
          value={actionType}
          onValueChange={(v: InlineType) => setActionType(v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Amal turini tanlang..." />
          </SelectTrigger>
          <SelectContent>
            {inlineOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="animate-in fade-in-50">
        {actionType === "login_url" && (
          <LoginUrlForm config={loginConfig} onConfigChange={setLoginConfig} />
        )}
        {actionType === "web_app" && (
          <WebAppForm url={webAppUrl} onUrlChange={setWebAppUrl} />
        )}
        {(actionType === "url" ||
          actionType === "callback" ||
          actionType.startsWith("switch_")) && (
          <div>
            <Label htmlFor="inline-value">{selectedOption?.label}</Label>
            <Input
              id="inline-value"
              placeholder={selectedOption?.placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        )}
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={handleAddClick}
        disabled={disabled}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Inline Tugma Qo'shish
      </Button>
    </div>
  );
};
