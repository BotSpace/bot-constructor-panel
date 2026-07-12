"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSubFlows } from "@/services/requests/plugin";
import { SubFlowPlugin } from "@/types/http/plugin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function PluginsPage() {
  const { lang } = useParams();
  const [plugins, setPlugins] = useState<SubFlowPlugin[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSubFlows({
        page,
        per_page: 12,
        category: category || undefined,
        active: "true",
      });
      setPlugins(res.data || []);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (e) {
      console.error("Plugin yuklashda xatolik:", e);
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🔌 Pluginlar</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {total} ta SubFlow plugin mavjud
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Kategoriya bo'yicha qidirish..."
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-64"
            />
            <Link href={`/${lang}`}>
              <Button variant="outline">← Konstruktorga</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : plugins.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground mb-2">
              Hech qanday plugin topilmadi
            </p>
            <p className="text-sm text-muted-foreground">
              Plugin qo&apos;shish uchun plugin boshqaruv panelidan foydalaning
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plugins.map((plugin) => (
              <Link
                key={plugin.id}
                href={`/${lang}/plugins/${plugin.id}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {plugin.name}
                        </CardTitle>
                        <CardDescription className="font-mono text-xs mt-1">
                          {plugin.slug}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={plugin.active ? "default" : "secondary"}
                        className={cn(
                          "text-[10px]",
                          plugin.active && "bg-emerald-500"
                        )}
                      >
                        {plugin.active ? "Faol" : "Nofaol"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {plugin.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {plugin.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {plugin.category && (
                        <Badge variant="outline" className="text-[10px]">
                          {plugin.category}
                        </Badge>
                      )}
                      {plugin.version && (
                        <Badge variant="outline" className="text-[10px]">
                          v{plugin.version}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        {plugin.outputs?.length || 0} chiqish
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {plugin.flow?.nodes?.length || 0} node
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
