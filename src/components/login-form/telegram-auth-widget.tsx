"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

/**
 * The constructor no longer issues its own session — auth lives in the
 * dashboard. If a user lands on `/auth` here, bounce them to the dashboard's
 * /login. Middleware also enforces this for any protected route.
 */
export default function TelegramAuth() {
  const t = useTranslations("auth.login");

  React.useEffect(() => {
    const dashboard = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3000";
    const url = new URL(dashboard.replace(/\/$/, "") + "/login");
    if (typeof window !== "undefined") {
      url.searchParams.set("from", window.location.href);
      window.location.replace(url.toString());
    }
  }, []);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("loading")}
      </div>
    </div>
  );
}
