// FAYL: app/api/flow/load/route.ts

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "nodes.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error: any) {
    // Agar nodes.json fayli hali mavjud bo'lmasa (birinchi marta ishga tushganda)
    if (error.code === "ENOENT") {
      // Bo'sh sxema qaytaramiz, bu xato emas.
      return NextResponse.json({ nodes: [], edges: [] });
    }
    // Boshqa xatoliklar bo'lsa
    console.error("Error loading flow:", error);
    return NextResponse.json(
      { message: "Failed to load flow.", error: error.message },
      { status: 500 }
    );
  }
}
1;
