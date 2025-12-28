# AI Integration - Setup Instructions

## 🚀 Tez Boshlash

### 1. Environment Variables

`.env.local` faylini yarating yoki mavjud faylga qo'shing:

```env
# Google AI API Key
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# AI Model (ixtiyoriy, default: gemini-1.5-flash)
# Free tier uchun tavsiya etilgan modellar:
# - gemini-1.5-flash (tez va bepul)
# - gemini-1.5-pro (kuchliroq, lekin sekinroq)
# NOTO'G'RI: gemini-2.0-flash-exp (experimental, free tier'da limit 0)
AI_MODEL=gemini-1.5-flash
```

### 2. Google AI API Key Olish

1. [Google AI Studio](https://makersuite.google.com/app/apikey) ga kiring
2. "Create API Key" tugmasini bosing
3. API key'ni nusxalab `.env.local` fayliga qo'shing

### 3. Loyihani Ishga Tushirish

```bash
# Dependencies o'rnatish (agar hali o'rnatilmagan bo'lsa)
npm install

# Development server ishga tushirish
npm run dev
```

### 4. AI Chat'ni Test Qilish

1. Browser'da `http://localhost:3001` ga kiring
2. Header'dagi "AI bot" tugmasini bosing
3. Savol yozing, masalan: "Qanday qilib xabar trigger yarataman?"

---

## 📁 Yaratilgan Fayllar

### API Routes

- ✅ `src/app/api/ai/chat/route.ts` - AI chat endpoint

### Services

- ✅ `src/services/requests/ai.ts` - AI service functions

### Hooks

- ✅ `src/hooks/use-ai-chat.ts` - AI chat React hook

### Components

- ✅ `src/components/layout/components/ai-chat/prompt-interface.tsx` - Yangilangan UI

### Documentation

- ✅ `docs/AI_INTEGRATION_GUIDE.md` - To'liq qo'llanma
- ✅ `docs/AI_SETUP_INSTRUCTIONS.md` - Setup qo'llanmasi (bu fayl)

---

## 🔧 Keyingi Qadamlar

### 1. Flow Generator (Tavsiya etiladi)

Natural language'dan bot flow yaratish funksiyasi.

**Fayllar:**

- `src/app/api/ai/generate-flow/route.ts`
- `src/hooks/use-ai-flow-generator.ts`
- `src/components/layout/components/ai-chat/flow-generator.tsx`

### 2. Code Assistant

CustomCodeNode uchun Python kod generatsiya qilish.

**Fayllar:**

- `src/app/api/ai/generate-code/route.ts`
- `src/hooks/use-ai-code-assistant.ts`

### 3. Flow Analyzer

Bot flow'ni tahlil qilish va optimallashtirish tavsiyalari.

---

## ⚠️ Muhim Eslatmalar

1. **API Key Xavfsizligi:**

   - API key'ni hech qachon Git'ga commit qilmang
   - `.env.local` fayl `.gitignore` da bo'lishi kerak

2. **Rate Limiting:**

   - Google AI API'da rate limitlar bor
   - Katta hajmdagi so'rovlar uchun debouncing ishlatish tavsiya etiladi

3. **Cost Management:**

   - API so'rovlarini monitoring qiling
   - Token limitlarini nazorat qiling

4. **Error Handling:**
   - Barcha xatolar to'g'ri handle qilingan
   - User-friendly error messages ko'rsatiladi

---

## 🐛 Muammolarni Hal Qilish

### API Key Xatosi

```
Error: GOOGLE_AI_API_KEY environment variable topilmadi
```

**Yechim:** `.env.local` faylida `GOOGLE_AI_API_KEY` mavjudligini tekshiring.

### Authentication Xatosi

```
Error: Autentifikatsiya talab qilinadi
```

**Yechim:** NextAuth session mavjudligini tekshiring. Login qiling.

### Model Xatosi

```
Error: Model topilmadi
```

**Yechim:** `AI_MODEL` environment variable'da to'g'ri model nomini ko'rsating.

---

## 📚 Qo'shimcha Ma'lumot

- [AI Integration Guide](./AI_INTEGRATION_GUIDE.md) - To'liq qo'llanma
- [Google AI Documentation](https://ai.google.dev/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Yaratilgan:** 2024
**Status:** ✅ Asosiy AI Chat tayyor va ishlamoqda
