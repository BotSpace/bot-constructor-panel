
import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage({ }: {}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Image
              src={'/logo.png'}
              alt="Logo"
              width={50}
              height={50}
            />
            BotSpace
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src={'/auth-bg.jpg'}
          alt="Image"
          className="absolute inset-0 h-full w-full object-center object-cover"
          width={1080}
          height={720}
        />
      </div>
    </div>
  )
}
