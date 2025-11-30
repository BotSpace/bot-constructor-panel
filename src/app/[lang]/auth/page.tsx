"use client";

import * as React from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { signIn } from "next-auth/react";

import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AuthenticationPage() {
  const [code, setCode] = React.useState<string>("");
  const t = useTranslations();

  const LoginUser = () => {
    toast.loading(t("auth.loginLoading"));

    signIn("credentials", {
      code: code,
      redirect: false,
    })
      .then(() => {
        toast.success(t("auth.loginSuccess"));
      })
      .catch(() => {
        toast.error(t("auth.loginError"));
      });
  };

  React.useEffect(() => {
    if (code.length == 6) {
      LoginUser();
    }
  }, [code]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6 text-center w-full">
        {/* Sarlavha va yo'riqnoma */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("auth.title")}
          </h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            {t("auth.description")}{" "}
            <a
              href="https://t.me/bot_mather_auth_bot" // Bu yerga o'z botingiz havolasini qo'ying
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-4"
            >
              {t("auth.telegramBot")}
            </a>{" "}
            {t("auth.getCode")}
          </p>
        </div>

        {/* Kod kiritish maydoni */}
        <InputOTP onChange={setCode} maxLength={6} className="w-full">
          <InputOTPGroup>
            <InputOTPSlot
              index={0}
              className="h-16 w-12 text-2xl"
            ></InputOTPSlot>
            <InputOTPSlot
              index={1}
              className="h-16 w-12 text-2xl"
            ></InputOTPSlot>
            <InputOTPSlot
              index={2}
              className="h-16 w-12 text-2xl"
            ></InputOTPSlot>
            <InputOTPSlot
              index={3}
              className="h-16 w-12 text-2xl"
            ></InputOTPSlot>
            <InputOTPSlot
              index={4}
              className="h-16 w-12 text-2xl"
            ></InputOTPSlot>
            <InputOTPSlot
              index={5}
              className="h-16 w-12 text-2xl"
            ></InputOTPSlot>
          </InputOTPGroup>
        </InputOTP>

        {/* Kodeni yuborish tugmasi */}
        <div className="flex gap-2">
          <Button>
            <Send />
            {t("auth.sendCode")}
          </Button>
          <Button onClick={() => LoginUser()}>
            <Send />
            {t("auth.debugLogin")}
          </Button>
        </div>
      </div>
    </div>
  );
}
