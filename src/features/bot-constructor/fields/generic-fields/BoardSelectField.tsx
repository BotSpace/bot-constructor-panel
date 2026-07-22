"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { instanceAuth } from "@/services/instance";
import useProjectStore from "@/features/bot-constructor/store/project";
import { useFlowStore } from "@/features/bot-constructor/store";
import type { NodeFieldManifest } from "@/features/bot-constructor/manifest/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldHelp } from "@/features/bot-constructor/components/FieldHelp";

type Board = { id: string; name: string; columns?: Column[] };
type Column = { id: string; name: string; position: number };

export function BoardSelectField({ nodeId, data, field, onPatch }: { nodeId: string; data: Record<string, unknown>; field: NodeFieldManifest; onPatch?: (partial: Record<string, unknown>) => void }) {
  const projectId = useProjectStore((state) => state.project?.id);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [boards, setBoards] = useState<Board[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const boardKey = field.key || "boardId";
  const columnKey = field.columnKey || "columnId";
  const boardId = typeof data[boardKey] === "string" ? String(data[boardKey]) : "";
  const columnId = typeof data[columnKey] === "string" ? String(data[columnKey]) : "";
  const write = (partial: Record<string, unknown>) => onPatch ? onPatch(partial) : updateNodeData(nodeId, partial);

  useEffect(() => {
    let active = true; setLoading(true); setError(false);
    instanceAuth.get<Board[]>("/boards", { params: { project_id: projectId } }).then((response) => { if (active) setBoards(Array.isArray(response.data) ? response.data : []); }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [projectId]);

  useEffect(() => {
    if (!boardId) { setColumns([]); return; }
    let active = true;
    instanceAuth.get<Board>(`/boards/${boardId}`).then((response) => { if (!active) return; const list = [...(response.data.columns ?? [])].sort((a, b) => a.position - b.position); setColumns(list); if (columnId && !list.some((column) => column.id === columnId)) write({ [columnKey]: "" }); }).catch(() => { if (active) setColumns([]); });
    return () => { active = false; };
  // write is intentionally excluded: store callbacks are stable, including it would refetch on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, columnId, columnKey]);

  const selectedBoardKnown = useMemo(() => !boardId || boards.some((board) => board.id === boardId), [boardId, boards]);
  return <div className="grid gap-3">
    <div className="flex items-center gap-1"><Label>{field.label || "Board"}</Label>{field.helpText && <FieldHelp text={field.helpText} />}</div>
    {loading ? <div className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Boardlar yuklanmoqda…</div> : error ? <div className="flex items-center gap-2 rounded-md border border-destructive/40 p-3 text-xs text-destructive"><AlertCircle className="h-4 w-4" />Boardlarni yuklab bo‘lmadi.</div> : boards.length === 0 ? <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">Bu botga bog‘langan board yo‘q. Dashboarddagi “Ishlar” bo‘limida board yarating va botni bog‘lang. <ExternalLink className="ml-1 inline h-3 w-3" /></div> : <Select value={selectedBoardKnown ? boardId : ""} onValueChange={(value) => write({ [boardKey]: value, [columnKey]: "" })}><SelectTrigger><SelectValue placeholder="Boardni tanlang" /></SelectTrigger><SelectContent>{boards.map((board) => <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>)}</SelectContent></Select>}
    {boardId && <Select value={columnId} onValueChange={(value) => write({ [columnKey]: value })} disabled={columns.length === 0}><SelectTrigger><SelectValue placeholder="Boshlang‘ich ustunni tanlang" /></SelectTrigger><SelectContent>{columns.map((column) => <SelectItem key={column.id} value={column.id}>{column.name}</SelectItem>)}</SelectContent></Select>}
  </div>;
}
