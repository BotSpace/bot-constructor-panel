// FAYL: constructor/components/ButtonGenerator/components/ReplyForm.tsx (YANGILANGAN)
import { useState, useMemo } from "react";
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
  Globe,
  BarChart3,
  Database,
  LayoutGrid,
  TextIcon,
  CheckCircle2,
  XCircle,
  Menu,
  ArrowLeft,
  ArrowRight,
  SkipForward,
  Home,
} from "lucide-react";
import { ButtonConfig } from "../types";
import { WebAppForm } from "./WebAppForm";
import { SendTextMessageNodeData } from "@/features/bot-constructor/nodes/actions/TextMessageNode/types";
import { useCollectionStore } from "@/features/collections/store/collection-list";
import { useReactQueryAction } from "@/services/react-query";
import { APIDetailCreateResponse } from "@/types/http/response";
import { CollectionDetail } from "@/types/http/collection";
import { Separator } from "@/components/ui/separator";
import SeparatorWithTitle from "@/components/common/separetor";
import { FilterBuilder } from "@/features/bot-constructor/nodes/actions/shared/filter/filter";
import { Filter } from "@/features/bot-constructor/nodes/actions/shared/filter/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNodes } from "reactflow";
import { StateNodeData } from "@/features/bot-constructor/nodes/custom/StateNode/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CollectionButtonForm } from "./CollectionButtonForm";

interface ReplyFormProps {
  onAdd: (button: ButtonConfig) => void;
  disabled: boolean;
  data?: SendTextMessageNodeData;
}

type ReplyType = "reply" | "web_app" | "request_poll" | "request_contact" | "request_location" | "request_poll" | "request_live_location"


const replyOptions: {
  value: ReplyType;
  label: string;
  icon?: React.ReactNode;
}[] = [
    {
      value: "reply",
      label: "Matnli tugma",
      icon: <TextIcon className="h-4 w-4" />,
    },
    { value: "web_app", label: "Web App", icon: <Globe className="h-4 w-4" /> },
    {
      value: "request_poll",
      label: "So'rovnoma",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      value: "request_contact",
      label: "Kontakt",
      icon: <Smartphone className="h-4 w-4" />,
    },
    {
      value: "request_location",
      label: "Joylashuv",
      icon: <MapPin className="h-4 w-4" />,
    },
    {
      value: "request_live_location",
      label: "Jonli Joylashuv",
      icon: <MapPin className="h-4 w-4" />,
    },
  ];

// Common buttons configuration (Reply tugmalar uchun text = value bo'ladi)
const commonButtonGroups = [
  {
    title: "Navigatsiya",
    buttons: [
      { label: "⬅️ Ortga", variant: "outline" as const },
      { label: "Oldinga ➡️", variant: "outline" as const },
      { label: "⏭ O'tkazib yuborish", variant: "outline" as const },
    ],
  },
  {
    title: "Tasdiqlash",
    buttons: [
      { label: "✅ Tasdiqlash", variant: "default" as const },
      { label: "❌ Bekor qilish", variant: "destructive" as const },
    ],
  },
  {
    title: "Menyu",
    buttons: [
      { label: "🏠 Bosh menyu", variant: "secondary" as const },
      { label: "📋 Menyu", variant: "secondary" as const },
    ],
  },
];

export const ReplyForm = ({ onAdd, disabled }: ReplyFormProps) => {
  const [text, setText] = useState("");
  const [actionType, setActionType] = useState<ReplyType>("reply");
  const [webAppUrl, setWebAppUrl] = useState("");
  const [pollType, setPollType] = useState<"quiz" | "regular">("regular");

  // Collection ma'lumotlari
  const { data: collections } = useCollectionStore();
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [selectedField, setSelectedField] = useState<string>("");
  const [filters, setFilters] = useState<Filter[]>([]);

  // Layout settings
  const [columns, setColumns] = useState<number>(2);
  const [rows, setRows] = useState<number>(5);
  const [enablePagination, setEnablePagination] = useState<boolean>(true);

  // Collection field'larini olish
  const { data: collectionFields } = useReactQueryAction<
    APIDetailCreateResponse<CollectionDetail>
  >({
    url: selectedCollection
      ? `collection/${selectedCollection}/?project=[id]`
      : "",
    enabled: !!selectedCollection,
  });

  const handleAddClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      case "web_app":
        if (!webAppUrl) {
          alert("Web App URL manzilini kiriting.");
          return;
        }
        newButton.webApp = { url: webAppUrl };
        break;
      case "request_poll":
        newButton.pollType = pollType;
        break;
      case "reply":
        break;
    }

    onAdd(newButton as ButtonConfig);
    setText("");
    setWebAppUrl("");
    setActionType("reply");
    setPollType("regular");
  };

  // Maxsus so'rovlar (Contact, Location, Poll)
  const handleAddSpecial = (
    type: "request_contact" | "request_location" | "request_poll"
  ) => {
    let newButton: ButtonConfig;
    const uniqueId = `btn-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    switch (type) {
      case "request_contact":
        newButton = {
          id: uniqueId,
          text: "📱 Kontaktimni yuborish",
          type,
        };
        break;
      case "request_location":
        newButton = {
          id: uniqueId,
          text: "📍 Joylashuvimni yuborish",
          type,
        };
        break;
      case "request_poll":
        newButton = {
          id: uniqueId,
          text: `📊 So'rovnoma yaratish (${pollType === "quiz" ? "Viktorina" : "Oddiy"
            })`,
          type,
          pollType,
        };
        break;
      default:
        return;
    }
    onAdd(newButton);
  };

  // Common Text Buttons qo'shish
  const handleAddCommonButton = (btnLabel: string) => {
    const newButton: ButtonConfig = {
      id: `btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: btnLabel,
      type: "reply",
    };
    onAdd(newButton);
  };

  return (
    <div className="mt-4 space-y-4">
      <form onSubmit={handleAddClick} className="space-y-4">
        <div className="grid grid-cols-6 gap-2">
          <div className="col-span-4 flex flex-col gap-1.5">
            <Label htmlFor="reply-text">Tugma matni</Label>
            <Input
              id="reply-text"
              placeholder="Masalan, Asosiy Menyu"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>Amal turi</Label>
            <Select
              value={actionType}
              onValueChange={(v: ReplyType) => setActionType(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Amal turini tanlang..." />
              </SelectTrigger>
              <SelectContent>
                {replyOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="animate-in fade-in-50">
          {actionType === "web_app" && (
            <WebAppForm url={webAppUrl} onUrlChange={setWebAppUrl} />
          )}
          {actionType === "request_poll" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="poll-type">So'rovnoma turi</Label>
              <Select
                value={pollType}
                onValueChange={(v: "quiz" | "regular") => setPollType(v)}
              >
                <SelectTrigger id="poll-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Oddiy</SelectItem>
                  <SelectItem value="quiz">Viktorina (Quiz)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={disabled}>
          <PlusCircle className="mr-2 h-4 w-4" /> Reply Tugma Qo'shish
        </Button>
      </form>

      <SeparatorWithTitle>Tezkor Tugmalar (Common)</SeparatorWithTitle>

      {/* Common Buttons Section */}
      <div className="space-y-3">
        {commonButtonGroups.map((group, index) => (
          <div key={index} className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </h4>
            <div className="flex flex-wrap gap-2">
              {group.buttons.map((btn, btnIndex) => (
                <Button
                  key={btnIndex}
                  type="button"
                  onClick={() => handleAddCommonButton(btn.label)}
                  variant={btn.variant}
                  size="sm"
                  disabled={disabled}
                  className="shadow-sm"
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SeparatorWithTitle>Maxsus so'rovlar</SeparatorWithTitle>

      {/* Maxsus so'rov tugmalari */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          type="button"
          onClick={() => handleAddSpecial("request_contact")}
          disabled={disabled}
        >
          <Smartphone className="mr-2 h-4 w-4" /> Kontakt
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          type="button"
          onClick={() => handleAddSpecial("request_location")}
          disabled={disabled}
        >
          <MapPin className="mr-2 h-4 w-4" /> Joylashuv
        </Button>

        <div className="col-span-2 flex gap-2 items-center bg-muted/40 p-2 rounded-md border">
          <div className="flex-grow space-y-1">
            <Label className="text-xs">So'rovnoma turi</Label>
            <Select
              value={pollType}
              onValueChange={(v: "quiz" | "regular") => setPollType(v)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Oddiy</SelectItem>
                <SelectItem value="quiz">Viktorina (Quiz)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            type="button"
            className="self-end"
            onClick={() => handleAddSpecial("request_poll")}
            disabled={disabled}
          >
            <BarChart3 className="mr-2 h-4 w-4" /> Poll Qo'shish
          </Button>
        </div>
      </div>

      <CollectionButtonForm
        onAdd={onAdd}
        buttonType="inline"
        disabled={disabled}
      />
    </div>
  );
};
