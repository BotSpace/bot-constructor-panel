"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CronType = "minutes" | "hours" | "days" | "weekly" | "monthly" | "yearly";

export interface CronEditorFieldConfig {
  type: "cron-editor";
  key?: string; // default "schedule"
  label?: string;
}

export interface CronEditorFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: CronEditorFieldConfig;
}

// ---------------------------------------------------------------------------
// Helpers — derive type / interval from a cron string
// ---------------------------------------------------------------------------

function parseInterval(part: string): string {
  if (part.startsWith("*/")) return part.slice(2);
  return "1"; // "*" → har biri (interval 1)
}

function deriveType(
  minute: string,
  hour: string,
  dayOfMonth: string,
  month: string,
  dayOfWeek: string
): CronType {
  if (minute === "*" || minute.startsWith("*/")) return "minutes";
  if (hour === "*" || hour.startsWith("*/")) return "hours";
  if (month !== "*") return "yearly";
  if (dayOfWeek !== "*") return "weekly";
  if (dayOfMonth !== "*" && !dayOfMonth.startsWith("*/")) return "monthly";
  return "days";
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function CronEditorField({ nodeId, data, field }: CronEditorFieldProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const scheduleKey = field.key ?? "schedule";

  const schedule =
    typeof data[scheduleKey] === "string"
      ? (data[scheduleKey] as string)
      : "0 9 * * *";

  const parts = schedule.split(" ");
  const [pMin, pHour, pDom, pMonth, pDow] =
    parts.length === 5 ? parts : ["0", "9", "*", "*", "*"];

  const initialType = deriveType(pMin, pHour, pDom, pMonth, pDow);
  const [type, setType] = useState<CronType>(initialType);

  // Interval N (minutes/hours/days uchun)
  const [intervalN, setIntervalN] = useState(() => {
    if (initialType === "minutes") return parseInterval(pMin);
    if (initialType === "hours") return parseInterval(pHour);
    if (initialType === "days") return parseInterval(pDom);
    return "1";
  });

  const [localMinute, setLocalMinute] = useState(
    pMin === "*" || pMin.startsWith("*/") ? "0" : pMin
  );
  const [localHour, setLocalHour] = useState(
    pHour === "*" || pHour.startsWith("*/") ? "9" : pHour
  );
  const [localDayOfMonth, setLocalDayOfMonth] = useState(
    pDom === "*" || pDom.startsWith("*/") ? "1" : pDom
  );
  const [localMonth, setLocalMonth] = useState(pMonth === "*" ? "1" : pMonth);
  const [localDayOfWeek, setLocalDayOfWeek] = useState(
    pDow === "*" ? "1" : pDow
  );

  useEffect(() => {
    const n = intervalN || "1";
    const every = n === "1" ? "*" : `*/${n}`;

    let cronMin = localMinute || "0";
    let cronHour = localHour || "0";
    let cronDom = "*";
    let cronMonth = "*";
    let cronDow = "*";

    if (type === "minutes") {
      cronMin = every;
      cronHour = "*";
    } else if (type === "hours") {
      cronHour = every;
    } else if (type === "days") {
      cronDom = every;
    } else if (type === "weekly") {
      cronDow = localDayOfWeek;
    } else if (type === "monthly") {
      cronDom = localDayOfMonth;
    } else if (type === "yearly") {
      cronDom = localDayOfMonth;
      cronMonth = localMonth;
    }

    const next = `${cronMin} ${cronHour} ${cronDom} ${cronMonth} ${cronDow}`;
    if (next !== data[scheduleKey]) {
      updateNodeData(nodeId, { [scheduleKey]: next });
    }
  }, [
    type,
    intervalN,
    localMinute,
    localHour,
    localDayOfMonth,
    localMonth,
    localDayOfWeek,
    data,
    nodeId,
    scheduleKey,
    updateNodeData,
  ]);

  const showMinute = type !== "minutes";
  const showHour =
    type === "days" ||
    type === "weekly" ||
    type === "monthly" ||
    type === "yearly";

  const intervalUnit =
    type === "minutes" ? "daqiqa" : type === "hours" ? "soat" : "kun";
  const intervalUnitIn =
    type === "minutes" ? "daqiqada" : type === "hours" ? "soatda" : "kunda";
  const intervalLabel =
    type === "minutes"
      ? "Har necha daqiqada"
      : type === "hours"
        ? "Har necha soatda"
        : "Har necha kunda";

  return (
    <div className="space-y-3">
      {field.label ? (
        <Label className="text-[11px] font-bold uppercase text-white/40">
          {field.label}
        </Label>
      ) : null}

      <div className="space-y-2">
        <Label className="text-[11px] font-bold uppercase text-white/40">
          Takrorlanish
        </Label>
        <Select
          value={type}
          onValueChange={(value) => setType(value as CronType)}
        >
          <SelectTrigger className="h-9 border-white/10 bg-zinc-950/60 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minutes">Daqiqa (har N daqiqada)</SelectItem>
            <SelectItem value="hours">Soat (har N soatda)</SelectItem>
            <SelectItem value="days">Kun (har N kunda)</SelectItem>
            <SelectItem value="weekly">Har hafta</SelectItem>
            <SelectItem value="monthly">Har oy</SelectItem>
            <SelectItem value="yearly">Har yili</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === "minutes" || type === "hours" || type === "days" ? (
        <div className="space-y-1.5">
          <Label className="text-[11px] text-white/40">{intervalLabel}</Label>
          <Input
            type="number"
            min="1"
            value={intervalN}
            className="border-white/10 bg-zinc-950/60 text-xs"
            onChange={(e) => setIntervalN(e.target.value)}
          />
          <p className="text-[10px] text-white/30">
            Masalan: 1 → har {intervalUnit}, 4 → har 4 {intervalUnitIn}
          </p>
        </div>
      ) : null}

      {showMinute ? (
        <div className={showHour ? "grid grid-cols-2 gap-3" : "space-y-1.5"}>
          {showHour ? (
            <div className="space-y-1.5">
              <Label className="text-[11px] text-white/40">Soat</Label>
              <Input
                type="number"
                min="0"
                max="23"
                value={localHour}
                className="border-white/10 bg-zinc-950/60 text-xs"
                onChange={(e) => setLocalHour(e.target.value)}
              />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/40">Daqiqa</Label>
            <Input
              type="number"
              min="0"
              max="59"
              value={localMinute}
              className="border-white/10 bg-zinc-950/60 text-xs"
              onChange={(e) => setLocalMinute(e.target.value)}
            />
          </div>
        </div>
      ) : null}

      {type === "weekly" ? (
        <div className="space-y-1.5">
          <Label className="text-[11px] text-white/40">Hafta kuni</Label>
          <Select value={localDayOfWeek} onValueChange={setLocalDayOfWeek}>
            <SelectTrigger className="h-9 border-white/10 bg-zinc-950/60 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Dushanba</SelectItem>
              <SelectItem value="2">Seshanba</SelectItem>
              <SelectItem value="3">Chorshanba</SelectItem>
              <SelectItem value="4">Payshanba</SelectItem>
              <SelectItem value="5">Juma</SelectItem>
              <SelectItem value="6">Shanba</SelectItem>
              <SelectItem value="0">Yakshanba</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {type === "monthly" || type === "yearly" ? (
        <div className="space-y-1.5">
          <Label className="text-[11px] text-white/40">Oyning sanasi</Label>
          <Input
            type="number"
            min="1"
            max="31"
            value={localDayOfMonth}
            className="border-white/10 bg-zinc-950/60 text-xs"
            onChange={(e) => setLocalDayOfMonth(e.target.value)}
          />
        </div>
      ) : null}

      {type === "yearly" ? (
        <div className="space-y-1.5">
          <Label className="text-[11px] text-white/40">Oy</Label>
          <Input
            type="number"
            min="1"
            max="12"
            value={localMonth}
            className="border-white/10 bg-zinc-950/60 text-xs"
            onChange={(e) => setLocalMonth(e.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}
