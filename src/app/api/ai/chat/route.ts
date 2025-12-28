import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

// Google Gemini API base URL
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

// System prompt - Bot constructor haqida context
const SYSTEM_PROMPT = `Sen Telegram Bot Constructor dasturining AI yordamchisisan. 
Foydalanuvchilar vizual drag-and-drop interfeysi orqali Telegram botlar yaratmoqda.

Bot strukturasi:
- Trigger Nodes: MessageTrigger, CommandTrigger, CallbackQueryTrigger, ReplyButtonTrigger, CronTrigger
- Action Nodes: SendTextMessage, SendPhoto, SendVideo, SendAudio, SendFile, EditMessage, DeleteMessage va boshqalar
- Custom Nodes: CustomCode (Python), State, Collection, IfCondition, Delay, Variable, HTTPRequest va boshqalar

Vazifang:
1. Bot yaratishda yordam berish
2. Node konfiguratsiyalarini tushuntirish
3. Bot logikasini optimallashtirish tavsiyalari berish
4. Xatolarni tuzatishda yordam berish
5. Natural language'dan bot flow yaratish tavsiyalari berish

Javoblar qisqa, aniq va amaliy bo'lishi kerak.`;

export async function POST(request: NextRequest) {
  try {
    // Authentication tekshirish
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Autentifikatsiya talab qilinadi" },
        { status: 401 }
      );
    }

    // API key tekshirish
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_AI_API_KEY environment variable topilmadi" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message maydoni majburiy va string bo'lishi kerak" },
        { status: 400 }
      );
    }

    // Model tanlash - Free tier uchun ishlaydigan modellar
    // gemini-1.5-flash - Tez va bepul tier'da ishlaydi
    // gemini-1.5-pro - Kuchliroq, lekin sekinroq
    // gemini-2.5-flash - Yangi model (agar mavjud bo'lsa)
    const modelName = process.env.AI_MODEL || "gemini-1.5-flash";

    // Full prompt
    const fullPrompt = `${SYSTEM_PROMPT}\n\nFoydalanuvchi: ${message}`;

    // Conversation history'ni formatlash
    // Google API format: contents array ichida role va parts
    const historyContents = conversationHistory.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Joriy xabarni qo'shish
    const contents = [
      ...historyContents,
      {
        role: "user",
        parts: [{ text: fullPrompt }],
      },
    ];

    // HTTP request yuborish
    const apiUrl = `${GEMINI_API_BASE}/models/${modelName}:generateContent`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contents,
      }),
    });

    // Response'ni parse qilish
    const responseData = await response.json();

    // Agar response muvaffaqiyatsiz bo'lsa
    if (!response.ok) {
      const errorData = responseData.error || responseData;
      throw {
        name: "ApiError",
        error: {
          code: response.status,
          message: errorData.message || response.statusText,
          status:
            response.status === 429
              ? "RESOURCE_EXHAUSTED"
              : response.status === 401 || response.status === 403
              ? "UNAUTHORIZED"
              : "ERROR",
          details: errorData.details || [],
        },
      };
    }

    // Response'dan text olish
    // Format: { candidates: [{ content: { parts: [{ text: "..." }] } }] }
    const text =
      responseData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Javob olinmadi";

    return NextResponse.json(
      {
        message: text,
        model: modelName,
        usage: responseData.usageMetadata, // Token usage ma'lumotlari
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("AI Chat Error:", error);

    // Google AI ApiError xatolari
    if (error.name === "ApiError" || error.error) {
      const apiError = error.error || error;
      const statusCode = apiError.code || apiError.status || 500;
      const errorMessage = apiError.message || error.message;

      // Quota exceeded xatolari
      if (
        statusCode === 429 ||
        statusCode === "RESOURCE_EXHAUSTED" ||
        errorMessage?.includes("quota") ||
        errorMessage?.includes("Quota exceeded") ||
        errorMessage?.includes("rate limit")
      ) {
        // Retry delay'ni extract qilish
        let retryAfter = 60; // Default 60 sekund
        try {
          const retryInfo = apiError.details?.find(
            (d: any) =>
              d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
          );
          if (retryInfo?.retryDelay) {
            retryAfter = Math.ceil(
              parseFloat(retryInfo.retryDelay.replace("s", ""))
            );
          }
        } catch (e) {
          // Ignore
        }

        return NextResponse.json(
          {
            error: `API limitiga yetildi. Iltimos, ${retryAfter} soniyadan keyin qaytadan urinib ko'ring.`,
            retryAfter,
            details:
              "Free tier limitiga yetildi. Iltimos, Google AI Studio'da billing sozlamalarini tekshiring yoki boshqa model ishlatishni ko'rib chiqing.",
          },
          { status: 429 }
        );
      }

      // API key xatolari
      if (
        statusCode === 401 ||
        statusCode === 403 ||
        errorMessage?.includes("API_KEY") ||
        errorMessage?.includes("API key")
      ) {
        return NextResponse.json(
          {
            error: "Noto'g'ri API key yoki API key o'rnatilmagan",
            details:
              "Iltimos, .env.local faylida GOOGLE_AI_API_KEY'ni to'g'ri o'rnatganingizni tekshiring.",
          },
          { status: 401 }
        );
      }

      // Boshqa API xatolari
      return NextResponse.json(
        {
          error: errorMessage || "AI so'rovni bajarishda xatolik yuz berdi",
          details: apiError.details,
        },
        { status: statusCode }
      );
    }

    // Umumiy xatolar
    return NextResponse.json(
      {
        error: error.message || "AI so'rovni bajarishda xatolik yuz berdi",
      },
      { status: 500 }
    );
  }
}

// Streaming response variant (keyinchalik qo'shish mumkin)
export async function GET() {
  return NextResponse.json(
    { message: "AI Chat API ishlamoqda. POST method ishlatish kerak." },
    { status: 200 }
  );
}
