"use client";

import { NodeProps } from "reactflow";
import { memo, useState, useEffect, useMemo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { SourceHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { CronTriggerNodeData } from "./types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CronTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CronTriggerNodeData>) => {
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // --- PARSING & DEFAULTS ---
  // Cron format: "min hour day month dayOfWeek"
  const getInitialValues = () => {
    const parts = data.schedule?.split(" ") || ["0", "9", "*", "*", "*"];
    const [m, h, dom, mon, dow] = parts;

    let initialType: "daily" | "weekly" | "monthly" | "yearly" = "daily";
    if (mon !== "*") initialType = "yearly";
    else if (dom !== "*") initialType = "monthly";
    else if (dow !== "*") initialType = "weekly";

    return {
      minute: m === "*" ? "0" : m,
      hour: h === "*" ? "9" : h,
      dayOfMonth: dom === "*" ? "1" : dom,
      month: mon === "*" ? "1" : mon,
      dayOfWeek: dow === "*" ? "1" : dow,
      type: initialType,
    };
  };

  const initial = useMemo(getInitialValues, []);

  const [type, setType] = useState(initial.type);
  const [minute, setMinute] = useState(initial.minute);
  const [hour, setHour] = useState(initial.hour);
  const [dayOfMonth, setDayOfMonth] = useState(initial.dayOfMonth);
  const [month, setMonth] = useState(initial.month);
  const [dayOfWeek, setDayOfWeek] = useState(initial.dayOfWeek);

  // --- VALIDATION HELPER ---
  const validateAndSet = (
    val: string,
    min: number,
    max: number,
    setter: (v: string) => void
  ) => {
    if (val === "") {
      setter("");
      return;
    }
    let num = parseInt(val);
    if (isNaN(num)) return;

    // Qiymatni chegaralash (Clamping)
    if (num < min) num = min;
    if (num > max) num = max;

    setter(num.toString());
  };

  // --- CRON GENERATOR ---
  useEffect(() => {
    let cronMinute = minute || "0";
    let cronHour = hour || "0";
    let cronDayOfMonth = "*";
    let cronMonth = "*";
    let cronDayOfWeek = "*";

    if (type === "weekly") {
      cronDayOfWeek = dayOfWeek;
    } else if (type === "monthly") {
      cronDayOfMonth = dayOfMonth || "1";
    } else if (type === "yearly") {
      cronDayOfMonth = dayOfMonth || "1";
      cronMonth = month;
    }

    const newSchedule = `${cronMinute} ${cronHour} ${cronDayOfMonth} ${cronMonth} ${cronDayOfWeek}`;

    if (data.schedule !== newSchedule) {
      updateNodeData(id, { schedule: newSchedule });
    }
  }, [type, minute, hour, dayOfMonth, month, dayOfWeek]);

  return (
    <Card
      className={cn("w-[350px] shadow-lg", selected && "ring-2 ring-primary")}
    >
      <NodeHeader
        icon="⏰"
        title="Cron Trigger"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase text-muted-foreground">
              Takrorlanish
            </Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Har kuni (Daily)</SelectItem>
                <SelectItem value="weekly">Har hafta (Weekly)</SelectItem>
                <SelectItem value="monthly">Har oy (Monthly)</SelectItem>
                <SelectItem value="yearly">Har yili (Yearly)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">
                Soat (0-23)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={hour}
                className={cn(!hour && "border-destructive")}
                onChange={(e) => validateAndSet(e.target.value, 0, 23, setHour)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">
                Daqiqa (0-59)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={minute}
                className={cn(!minute && "border-destructive")}
                onChange={(e) =>
                  validateAndSet(e.target.value, 0, 59, setMinute)
                }
              />
            </div>
          </div>

          {type === "weekly" && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
              <Label className="text-[11px] text-muted-foreground">
                Hafta kuni
              </Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger className="h-9">
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
          )}

          {(type === "monthly" || type === "yearly") && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
              <Label className="text-[11px] text-muted-foreground">
                Oyning sanasi (1-31)
              </Label>
              <Input
                type="number"
                value={dayOfMonth}
                onChange={(e) =>
                  validateAndSet(e.target.value, 1, 31, setDayOfMonth)
                }
              />
            </div>
          )}

          {type === "yearly" && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
              <Label className="text-[11px] text-muted-foreground">Oy</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(2000, i).toLocaleString("uz", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="mt-2 p-2 bg-secondary/50 rounded-md border border-dashed flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Cron Expression
            </span>
            <code className="text-xs font-mono font-bold text-primary">
              {data.schedule}
            </code>
          </div>
        </CardContent>
      )}

      <SourceHandles />
    </Card>
  );
};

export const CronTriggerNode = memo(CronTriggerNodeComponent);
