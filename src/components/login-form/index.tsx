'use client'

import TelegramAuth from "./telegram-auth-widget";
import { cn } from "@/lib/utils";

/**
 * Constructor no longer hosts a login flow — auth is handled by the dashboard.
 * Visiting `/auth` here simply redirects to `${DASHBOARD_URL}/login`.
 */
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <TelegramAuth />
    </form>
  )
}
