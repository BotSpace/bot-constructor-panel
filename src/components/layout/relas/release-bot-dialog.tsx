"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Check, Copy, ExternalLink, KeyRound, Loader2, Plus, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isTelegramTokenValid } from "@/lib/chech-bot-token";
import {
  claimManagedBot,
  connectProjectBot,
  getManagedBotConfig,
  listManagedBots,
  type ManagedBot,
  type ManagedBotConfig,
} from "@/services/requests/managedBot";

const TOKEN_RE = /^\d+:.+/;
const USERNAME_RE = /^[a-z][a-z0-9_]+$/;

function withBotSuffix(value: string) {
  const username = value.trim().toLowerCase();
  return username.endsWith("bot") ? username : `${username}bot`;
}

export function ReleaseBotDialog({
  projectId,
  onConnected,
  children,
}: {
  projectId: string;
  onConnected: () => Promise<boolean>;
  children: React.ReactNode;
}) {
  const t = useTranslations("releaseBot");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"managed" | "token">("managed");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [config, setConfig] = useState<ManagedBotConfig | null>(null);
  const [bots, setBots] = useState<ManagedBot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [botName, setBotName] = useState("");
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownBotIds = useRef<Set<string>>(new Set());

  function stopPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    setPolling(false);
  }

  useEffect(() => {
    if (!open) {
      stopPolling();
      return;
    }
    let cancelled = false;
    setLoading(true);
    setSelectedBotId(null);
    setToken("");
    Promise.all([getManagedBotConfig(), listManagedBots()])
      .then(([managedConfig, managedBots]) => {
        if (cancelled) return;
        setConfig(managedConfig);
        setBots(managedBots);
        knownBotIds.current = new Set(managedBots.map((bot) => bot.id));
        setTab(managedConfig.enabled ? "managed" : "token");
      })
      .catch(() => {
        if (!cancelled) setTab("token");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [open]);

  async function refreshBots() {
    const next = await listManagedBots();
    setBots(next);
    return next;
  }

  function buildDeepLink() {
    if (!config?.deep_link_template) return null;
    const nextUsername = withBotSuffix(username);
    return config.deep_link_template
      .replace("{username}", nextUsername)
      .replace("{name}", botName.trim() || nextUsername);
  }

  async function copyDeepLink() {
    const link = buildDeepLink();
    if (!link) {
      toast.error(t("managedUnavailable"));
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      toast.success(t("linkCopied"));
    } catch {
      toast.error(t("connectError"));
    }
  }

  async function createManagedBot() {
    const link = buildDeepLink();
    if (!link) {
      toast.error(t("managedUnavailable"));
      return;
    }
    try {
      const nextUsername = withBotSuffix(username);
      await claimManagedBot(nextUsername);
      knownBotIds.current = new Set(bots.map((bot) => bot.id));
      window.open(link, "_blank", "noopener,noreferrer");
      setPolling(true);
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts += 1;
        try {
          const next = await refreshBots();
          const created = next.find((bot) => !knownBotIds.current.has(bot.id));
          if (created) {
            stopPolling();
            setSelectedBotId(created.id);
            toast.success(t("managedConnected"));
            return;
          }
        } catch {
          // The next polling cycle retries transient failures.
        }
        if (attempts >= 40) {
          stopPolling();
          toast.error(t("managedTimeout"));
        }
      }, 3000);
    } catch {
      toast.error(t("connectError"));
    }
  }

  async function submit() {
    if (tab === "managed" && !selectedBotId) {
      toast.error(t("selectBot"));
      return;
    }
    const trimmedToken = token.trim();
    if (tab === "token") {
      if (!TOKEN_RE.test(trimmedToken)) {
        toast.error(t("tokenInvalid"));
        return;
      }
      setSubmitting(true);
      if (!(await isTelegramTokenValid(trimmedToken))) {
        setSubmitting(false);
        toast.error(t("tokenInvalid"));
        return;
      }
    } else {
      setSubmitting(true);
    }

    try {
      await connectProjectBot(
        projectId,
        tab === "managed" ? { managed_bot_id: selectedBotId! } : { token: trimmedToken }
      );
      await onConnected();
      // The bot is already connected even if release creation is temporarily
      // blocked (for example by the running-bot limit). Close this dialog so
      // the actionable release error/modal remains visible.
      setOpen(false);
    } catch {
      toast.error(t("connectError"));
    } finally {
      setSubmitting(false);
    }
  }

  const normalizedUsername = username.trim().toLowerCase();
  const usernameValid =
    USERNAME_RE.test(normalizedUsername) &&
    withBotSuffix(normalizedUsername).length >= 5 &&
    withBotSuffix(normalizedUsername).length <= 32;
  const availableBots = bots.filter((bot) => !bot.used || bot.id === selectedBotId);

  return (
    <Dialog open={open} onOpenChange={(value) => !submitting && setOpen(value)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[88vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("loading")}
          </div>
        ) : (
          <Tabs value={tab} onValueChange={(value) => setTab(value as "managed" | "token")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="managed" className="gap-2" disabled={!config?.enabled}>
                <Bot className="h-4 w-4" /> {t("managedTab")}
              </TabsTrigger>
              <TabsTrigger value="token" className="gap-2">
                <KeyRound className="h-4 w-4" /> {t("tokenTab")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="managed" className="mt-4 space-y-5 overflow-y-auto pr-1">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("selectExisting")}</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => void refreshBots().catch(() => toast.error(t("connectError")))}
                  >
                    <RefreshCw className="h-4 w-4" /> {t("refresh")}
                  </Button>
                </div>
                {availableBots.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {availableBots.map((bot) => {
                      const selected = selectedBotId === bot.id;
                      return (
                        <button
                          type="button"
                          key={bot.id}
                          onClick={() => setSelectedBotId(bot.id)}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                            selected ? "border-blue-500 bg-blue-500/10" : "border-border hover:bg-muted/60"
                          }`}
                        >
                          <span className={`grid h-9 w-9 place-items-center rounded-full ${selected ? "bg-blue-500 text-white" : "bg-muted"}`}>
                            {selected ? <Check className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{bot.name || bot.username}</span>
                            <span className="block truncate text-xs text-muted-foreground">@{bot.username}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
                    {t("noBots")}
                  </div>
                )}
              </div>

              <div className="rounded-xl border bg-muted/25 p-4 space-y-3">
                <div className="flex items-center gap-2 font-medium">
                  <Plus className="h-4 w-4 text-blue-500" /> {t("createManaged")}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="managed-username">{t("username")}</Label>
                    <Input id="managed-username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="my_company" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="managed-name">{t("botName")}</Label>
                    <Input id="managed-name" value={botName} onChange={(event) => setBotName(event.target.value)} placeholder={t("botNamePlaceholder")} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t("managedHint")}</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => void createManagedBot()} disabled={!usernameValid || polling}>
                    {polling ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                    {polling ? t("waiting") : t("openTelegram")}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => void copyDeepLink()} disabled={!usernameValid}>
                    <Copy className="h-4 w-4" /> {t("copyLink")}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="token" className="mt-4 space-y-3">
              <Label htmlFor="release-token">{t("tokenLabel")}</Label>
              <Input
                id="release-token"
                type="password"
                autoComplete="off"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder={t("tokenPlaceholder")}
                onKeyDown={(event) => event.key === "Enter" && void submit()}
              />
              <p className="text-xs text-muted-foreground">{t("tokenHint")}</p>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            {t("cancel")}
          </Button>
          <Button type="button" onClick={() => void submit()} disabled={loading || submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? t("publishing") : t("connectAndPublish")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
