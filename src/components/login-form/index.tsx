'use client'

import { useTranslations } from "next-intl";
import GoogleAuthWidget from "./google-auth-widget";
import TelegramAuth from "./telegram-auth-widget";
import { cn } from "@/lib/utils";
import { FieldGroup, FieldSeparator } from "../ui/field";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const t = useTranslations("auth.loginForm");

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
        </div>
        <TelegramAuth />
        <FieldSeparator>{t("orContinueWith")}</FieldSeparator>
        <GoogleAuthWidget />
      </FieldGroup>
    </form>
  )
}
