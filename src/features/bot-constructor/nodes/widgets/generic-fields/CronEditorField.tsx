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

type CronType = "daily" | "weekly" | "monthly" | "yearly";

export interface CronEditorFieldConfig {
  type: "cron-editor";
  key?: string;   // default "schedule"
  label?: string;
}

export interface CronEditorFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: CronEditorFieldConfig;
}

// ---------------------------------------------------------------------------
// Helper — derive initial CronType from a cron string
// ---------------------------------------------------------------------------

function deriveType(
  month: string,
  dayOfMonth: string,
  dayOfWeek: string
): CronType {
  if (month !== "*") return "yearly";
  if (dayOfMonth !== "*") return "monthly";
  if (dayOfWeek !== "*") return "weekly";
  return "daily";
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function CronEditorField({ nodeId, data, field }: CronEditorFieldProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const scheduleKey = field.key ?? "schedule";

  const schedule = typeof data[scheduleKey] === "string"
    ? (data[scheduleKey] as string)
    : "0 9 * * *";

  const parts = schedule.split(" ");
  const [minute, hour, dayOfMonth, month, dayOfWeek] =
    parts.length === 5 ? parts : ["0", "9", "*", "*", "*"];

  const [type, setType] = useState<CronType>(() =>
    deriveType(month, dayOfMonth, dayOfWeek)
  );
  const [localMinute, setLocalMinute] = useState(minute === "*" ? "0" : minute);
  const [localHour, setLocalHour] = useState(hour === "*" ? "9" : hour);
  const [localDayOfMonth, setLocalDayOfMonth] = useState(
    dayOfMonth === "*" ? "1" : dayOfMonth
  );
  const [localMonth, setLocalMonth] = useState(month === "*" ? "1" : month);
  const [localDayOfWeek, setLocalDayOfWeek] = useState(
    dayOfWeek === "*" ? "1" : dayOfWeek
  );

  useEffect(() => {
    let cronDayOfMonth = "*";
    let cronMonth = "*";
    let cronDayOfWeek = "*";

    if (type === "weekly") cronDayOfWeek = localDayOfWeek;
    if (type === "monthly" || type === "yearly") cronDayOfMonth = localDayOfMonth;
    if (type === "yearly") cronMonth = localMonth;

    const nextSchedule = `${localMinute || "0"} ${localHour || "0"} ${cronDayOfMonth} ${cronMonth} ${cronDayOfWeek}`;
    if (nextSchedule !== data[scheduleKey]) {
      updateNodeData(nodeId, { [scheduleKey]: nextSchedule });
    }
  }, [
    data,
    localDayOfMonth,
    localDayOfWeek,
    localHour,
    localMinute,
    localMonth,
    nodeId,
    scheduleKey,
    type,
    updateNodeData,
  ]);

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
        <Select value={type} onValueChange={(value) => setType(value as CronType)}>
          <SelectTrigger className="h-9 border-white/10 bg-zinc-950/60 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Har kuni</SelectItem>
            <SelectItem value="weekly">Har hafta</SelectItem>
            <SelectItem value="monthly">Har oy</SelectItem>
            <SelectItem value="yearly">Har yili</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[11px] text-white/40">Soat</Label>
          <Input
            type="number"
            value={localHour}
            className="border-white/10 bg-zinc-950/60 text-xs"
            onChange={(e) => setLocalHour(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-white/40">Daqiqa</Label>
          <Input
            type="number"
            value={localMinute}
            className="border-white/10 bg-zinc-950/60 text-xs"
            onChange={(e) => setLocalMinute(e.target.value)}
          />
        </div>
      </div>

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
            value={localMonth}
            className="border-white/10 bg-zinc-950/60 text-xs"
            onChange={(e) => setLocalMonth(e.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}
