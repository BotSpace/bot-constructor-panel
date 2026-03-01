"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSubFlow } from "@/services/requests/plugin";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PluginDetailPage() {
  const { lang, pluginId } = useParams();
  const router = useRouter();
  const [plugin, setPlugin] = useState<SubFlowPlugin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pluginId) return;
    getSubFlow(pluginId as string)
      .then(setPlugin)
      .catch(() => setError("Plugin topilmadi"))
      .finally(() => setLoading(false));
  }, [pluginId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-8" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !plugin) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-lg text-destructive mb-4">{error || "Plugin topilmadi"}</p>
        <Button variant="outline" onClick={() => router.push(`/${lang}/plugins`)}>
          ← Pluginlarga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${lang}/plugins`)}
            >
              ←
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                🔌 {plugin.name}
                <Badge
                  variant={plugin.active ? "default" : "secondary"}
                  className={plugin.active ? "bg-emerald-500" : ""}
                >
                  {plugin.active ? "Faol" : "Nofaol"}
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                {plugin.slug} · v{plugin.version}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {plugin.description && (
          <p className="text-muted-foreground mb-6">{plugin.description}</p>
        )}

        <Tabs defaultValue="schema">
          <TabsList>
            <TabsTrigger value="schema">Params Schema</TabsTrigger>
            <TabsTrigger value="outputs">Chiqishlar ({plugin.outputs?.length || 0})</TabsTrigger>
            <TabsTrigger value="flow">Flow ({plugin.flow?.nodes?.length || 0} node)</TabsTrigger>
            <TabsTrigger value="info">Ma&apos;lumot</TabsTrigger>
          </TabsList>

          <TabsContent value="schema" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Params Schema (JSON Schema)</CardTitle>
                <CardDescription>
                  Bu schema asosida konstruktorda forma avtomatik yaratiladi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto max-h-96">
                  {JSON.stringify(plugin.params_schema, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outputs" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chiqishlar</CardTitle>
                <CardDescription>
                  SubFlow tugagandan keyin mumkin bo&apos;lgan chiqish yo&apos;nalishlari
                </CardDescription>
              </CardHeader>
              <CardContent>
                {plugin.outputs?.length ? (
                  <div className="space-y-3">
                    {plugin.outputs.map((out, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Badge variant="outline">{out.name}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {out.description}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Chiqishlar belgilanmagan</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flow" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Flow</CardTitle>
                <CardDescription>
                  {plugin.flow?.nodes?.length || 0} ta node, {plugin.flow?.edges?.length || 0} ta ulanish
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto max-h-96">
                  {JSON.stringify(plugin.flow, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Plugin ma&apos;lumotlari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow label="Nomi" value={plugin.name} />
                <Separator />
                <InfoRow label="Slug" value={plugin.slug} />
                <Separator />
                <InfoRow label="Kategoriya" value={plugin.category || "—"} />
                <Separator />
                <InfoRow label="Versiya" value={plugin.version || "—"} />
                <Separator />
                <InfoRow label="Holat" value={plugin.active ? "Faol" : "Nofaol"} />
                <Separator />
                <InfoRow
                  label="Yaratilgan"
                  value={new Date(plugin.created_at).toLocaleString()}
                />
                <Separator />
                <InfoRow
                  label="Yangilangan"
                  value={new Date(plugin.updated_at).toLocaleString()}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
