"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";

const DynamicPythonEditor = dynamic(() => import("@/components/editor"), {
  ssr: false,
  loading: () => <p>Editorni yuklash...</p>,
});

// Aiogram uchun boshlang'ich kod
const initialCode = `import asyncio
import logging
from aiogram import Bot, Dispatcher, Router, F
from aiogram.types import Message
from aiogram.filters import CommandStart

# Bot tokenini bu yerga yozing
# API_TOKEN = "SIZNING_BOT_TOKENINGIZ"

# Router yaratamiz
router = Router()

@router.message(CommandStart())
async def cmd_start(message: Message):
    """
    Bu handler /start komandasini ushlaydi
    """
    await message.answer(f"Salom, {message.from_user.full_name}!")

@router.message(F.text.lower() == "salom")
async def greet_user(message: Message):
    await message.reply("Vaalaykum assalom!")

async def main():
    # bot = Bot(token=API_TOKEN)
    dp = Dispatcher()
    dp.include_router(router)

    # await bot.delete_webhook(drop_pending_updates=True)
    # await dp.start_polling(bot)
    print("Bot ishlashga tayyor (polling boshlanmadi)")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
`;

export default function HomePage() {
  const [code, setCode] = useState(initialCode);

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <Head>
        <title>Aiogram Python Editor</title>
      </Head>
      <main style={{ padding: "20px" }}>
        <h1>Aiogram 3.x uchun Python Code Editor</h1>
        <p>
          Endi Aiogram 3.2+ kutubxonasi uchun IntelliSense qo'shildi!
          <b>`aiogram_`, `@router`, `F.`</b> kabi so'zlarni yozib ko'ring.
        </p>

        <div
          style={{
            border: "1px solid #333",
            marginTop: "20px",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <DynamicPythonEditor initialCode={code} onCodeChange={setCode} />
        </div>

        <div style={{ marginTop: "20px" }}>
          <h2>Hozirgi kod:</h2>
          <pre
            style={{
              backgroundColor: "#1e1e1e",
              color: "#d4d4d4",
              padding: "15px",
              borderRadius: "5px",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          >
            {code}
          </pre>
        </div>
      </main>
    </div>
  );
}
