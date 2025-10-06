"use client";

import * as React from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Image from "next/image";

import Logo from "@/public/logo/android-chrome-512x512.png";
import { signIn } from "next-auth/react";

import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export default function AuthenticationPage() {
  const [code, setCode] = React.useState<string>("");

  const LoginUser = () => {
    toast.loading("Login...");

    signIn("credentials", {
      code: code,
      callbackUrl: "/",
    })
      .then(() => {
        toast.success("Login success");
      })
      .catch(() => {
        toast.error("Login error");
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
        <Image
          className="rounded-4xl w-[200px]"
          src={Logo}
          alt="logo"
          width={500}
          height={400}
        ></Image>

        {/* Sarlavha va yo'riqnoma */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Kodni Kiriting
          </h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            <a
              href="https://t.me/bot_mather_auth_bot" // Bu yerga o'z botingiz havolasini qo'ying
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-4"
            >
              @bot_mather_auth_bot
            </a>{" "}
            telegram botiga kiring va 1 daqiqalik kodingizni oling.
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
            Kodni Yuborish
          </Button>
          <Button onClick={() => LoginUser()}>
            <Send />
            DEBUG Login
          </Button>
        </div>
      </div>
    </div>
  );
}
