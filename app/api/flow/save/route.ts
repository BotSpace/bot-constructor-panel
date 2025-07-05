// FAYL: app/api/flow/save/route.ts

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nodes, edges } = body;

    // 1. Kelayotgan ma'lumotlarni tekshirish
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return NextResponse.json(
        {
          message:
            "Invalid data format. 'nodes' and 'edges' arrays are required.",
        },
        { status: 400 }
      );
    }

    // 2. Fayl mazmunini tayyorlash
    const fileContent = JSON.stringify({ nodes, edges }, null, 2);

    // --- MANZILLARNI ANIQLASH ---

    // Manba fayl: Next.js loyihasining ildizidagi `nodes.json`
    // `process.cwd()` hozirgi ishlayotgan jarayon (Next.js loyihasi) papkasini qaytaradi.
    const sourceFilePath = path.join(process.cwd(), "nodes.json");

    // Maqsad fayl: Sizning Python loyihangiz (`dvijok`) joylashgan papkadagi `nodes.json`
    // Bu yo'lni to'g'ri va to'liq (absolyut) ko'rsatish juda muhim!
    const destinationFilePath = path.join(
      "/home/kumo/workspace/dvijok",
      "nodes.json"
    );

    // --- FAYLLAR BILAN ISHLASH ---

    // 3. Avval Next.js loyihasi ichida saqlaymiz.
    // Bu fayl keyinchalik "load" funksiyasi uchun kerak bo'ladi.
    await fs.writeFile(sourceFilePath, fileContent, "utf-8");

    // 4. Keyin shu faylni Python loyihasi papkasiga nusxalaymiz (copy).
    // `fs.copyFile` aynan shu ishni bajaradi.
    await fs.copyFile(sourceFilePath, destinationFilePath);

    // 5. Muvaffaqiyatli javob qaytaramiz
    return NextResponse.json({
      message: `Flow saved successfully and copied to ${destinationFilePath}.`,
    });
  } catch (error: any) {
    console.error("Error saving or copying flow:", error);
    return NextResponse.json(
      { message: "Failed to save or copy the flow.", error: error.message },
      { status: 500 }
    );
  }
}
