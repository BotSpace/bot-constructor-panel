# AI Integration Guide - Bot Constructor Panel

## 📋 Loyiha Tahlili

Loyiha **Telegram Bot Constructor** - vizual drag-and-drop interfeysi bilan botlar yaratish uchun professional dastur.

### Mavjud Texnologiyalar:
- ✅ Next.js 15 (App Router)
- ✅ React 19 + TypeScript
- ✅ `@google/genai` paketi o'rnatilgan
- ✅ AI chat komponenti mavjud (lekin hozircha mock)
- ✅ React Query (API calls uchun)
- ✅ Zustand (State management)
- ✅ React Flow (Node-based flow builder)

---

## 🎯 AI Integration Strategiyalari

### 1. **AI Chat Assistant** (Asosiy)
**Maqsad:** Foydalanuvchiga bot yaratishda yordam berish

**Xususiyatlar:**
- Natural language'dan bot flow generatsiya qilish
- Node konfiguratsiyalarini tushuntirish
- Bot logikasini optimallashtirish tavsiyalari
- Xatolarni tuzatishda yordam

**Implementatsiya:**
```typescript
// API Route: /api/ai/chat
// Service: services/requests/ai.ts
// Hook: hooks/use-ai-chat.ts
```

### 2. **AI Flow Generator**
**Maqsad:** Matnli tavsifdan bot flow yaratish

**Misol:**
```
User: "Men 'Salom' deb yozsam, bot 'Assalomu alaykum' deb javob bersin"
AI: [MessageTriggerNode + SendTextMessageNode yaratadi]
```

**Implementatsiya:**
- Natural language → Flow JSON konvertatsiya
- AI'ga bot strukturasi haqida context berish
- Yaratilgan node'larni canvas'ga qo'shish

### 3. **AI Code Assistant**
**Maqsad:** CustomCodeNode uchun Python kod generatsiya qilish

**Xususiyatlar:**
- Natural language'dan Python kod yozish
- Kod tushuntirish va optimallashtirish
- Xatolarni tuzatish

### 4. **AI Response Generator**
**Maqsad:** Bot javoblarini yaratish va optimallashtirish

**Xususiyatlar:**
- Kontekstga mos javoblar generatsiya qilish
- Turli tillarda javoblar
- Ton va uslubni sozlash

### 5. **AI Flow Analyzer**
**Maqsad:** Bot flow'ni tahlil qilish va tavsiyalar berish

**Xususiyatlar:**
- Performance optimizatsiya
- Logic xatolarini topish
- Best practices tavsiyalari

---

## 🏗️ Arxitektura Tavsiyalari

### 1. **API Layer Strukturasi**

```
src/
├── app/
│   └── api/
│       └── ai/
│           ├── chat/
│           │   └── route.ts          # Chat endpoint
│           ├── generate-flow/
│           │   └── route.ts          # Flow generation
│           ├── generate-code/
│           │   └── route.ts          # Code generation
│           └── analyze-flow/
│               └── route.ts          # Flow analysis
├── services/
│   └── requests/
│       └── ai.ts                      # AI service functions
├── hooks/
│   ├── use-ai-chat.ts                 # Chat hook
│   ├── use-ai-flow-generator.ts       # Flow generator hook
│   └── use-ai-code-assistant.ts      # Code assistant hook
└── features/
    └── ai-assistant/
        ├── components/
        │   ├── ai-chat-panel.tsx
        │   ├── flow-generator.tsx
        │   └── code-assistant.tsx
        ├── store/
        │   └── ai-store.ts
        └── types/
            └── ai.types.ts
```

### 2. **AI Provider Tanlash**

#### Variant 1: Google Gemini (Tavsiya etiladi)
**Afzalliklari:**
- ✅ Paket allaqachon o'rnatilgan (`@google/genai`)
- ✅ Bepul tier mavjud
- ✅ Tez va samarali
- ✅ Streaming support

**Implementatsiya:**
```typescript
import { GoogleGenerativeAI } from "@google/genai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
```

#### Variant 2: OpenAI GPT-4
**Afzalliklari:**
- ✅ Eng kuchli model
- ✅ Keng qo'llab-quvvatlash
- ✅ Function calling support

**Implementatsiya:**
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

#### Variant 3: Hybrid (Ikkalasini ham)
- Oddiy so'rovlar uchun Gemini (arzon)
- Murakkab so'rovlar uchun GPT-4 (kuchli)

---

## 📝 Implementation Plan

### Bosqich 1: Asosiy AI Chat (1-2 kun)

1. **API Route yaratish**
   - `/api/ai/chat/route.ts`
   - Google Gemini integratsiyasi
   - Streaming response support

2. **Service layer**
   - `services/requests/ai.ts`
   - Chat function
   - Error handling

3. **Hook yaratish**
   - `hooks/use-ai-chat.ts`
   - React Query integration
   - Loading states

4. **UI yangilash**
   - `prompt-interface.tsx` ni haqiqiy API bilan ulash
   - Response streaming ko'rsatish
   - Error handling

### Bosqich 2: Flow Generator (2-3 kun)

1. **Context Builder**
   - Bot strukturasi haqida ma'lumot
   - Node types va ularning xususiyatlari
   - Mavjud flow'ni context sifatida berish

2. **Flow Parser**
   - AI response'dan JSON extract qilish
   - Validation
   - Canvas'ga qo'shish

3. **UI Component**
   - Flow generator dialog
   - Preview
   - Apply button

### Bosqich 3: Code Assistant (1-2 kun)

1. **Code Generation**
   - CustomCodeNode context
   - Python code generation
   - Code explanation

2. **Integration**
   - CodeEditorDialog'ga qo'shish
   - Inline suggestions

### Bosqich 4: Advanced Features (3-5 kun)

1. **Flow Analyzer**
   - Performance analysis
   - Logic checking
   - Best practices

2. **Response Generator**
   - Context-aware responses
   - Multi-language support

---

## 🔐 Xavfsizlik va Environment Variables

`.env.local` fayliga qo'shing:

```env
# Google AI
GOOGLE_AI_API_KEY=your_api_key_here

# Yoki OpenAI
OPENAI_API_KEY=your_api_key_here

# AI Settings
AI_MODEL=gemini-pro  # yoki gpt-4, gpt-3.5-turbo
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
```

---

## 💡 Best Practices

### 1. **Prompt Engineering**
- System prompt'ni yaxshi tayyorlash
- Bot strukturasi haqida batafsil ma'lumot
- Examples qo'shish

### 2. **Error Handling**
- API xatolarini to'g'ri handle qilish
- Rate limiting
- Fallback mechanisms

### 3. **Performance**
- Response caching
- Debouncing
- Streaming responses

### 4. **User Experience**
- Loading states
- Progress indicators
- Error messages (user-friendly)

### 5. **Cost Management**
- Token limitlari
- Request throttling
- Usage tracking

---

## 🎨 UI/UX Tavsiyalari

### AI Chat Panel
- Floating button (hozirgi kabi)
- Sidebar panel (katta so'rovlar uchun)
- Chat history
- Quick actions (Generate Flow, Explain Code, etc.)

### Flow Generator
- Step-by-step wizard
- Preview before apply
- Undo/Redo support

### Code Assistant
- Inline suggestions
- Code completion
- Explanation tooltips

---

## 📊 Monitoring va Analytics

1. **Usage Tracking**
   - Qanday AI features ishlatilmoqda
   - Qancha so'rov yuborilmoqda
   - Response times

2. **Error Tracking**
   - API xatolari
   - User feedback

3. **Cost Tracking**
   - Token usage
   - API costs

---

## 🚀 Keyingi Qadamlar

1. ✅ **Hozirgi holatni tahlil qilish** (tugallandi)
2. ⏳ **API Route yaratish** (keyingi qadam)
3. ⏳ **Service layer implementatsiya**
4. ⏳ **UI yangilash**
5. ⏳ **Testing**
6. ⏳ **Documentation**

---

## 📚 Foydali Resurslar

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [React Query](https://tanstack.com/query/latest)

---

## ❓ Savollar va Javoblar

**Q: Qaysi AI provider'ni tanlash kerak?**
A: Agar `@google/genai` allaqachon o'rnatilgan bo'lsa, Gemini bilan boshlash tavsiya etiladi. Keyinchalik OpenAI'ga ham qo'shish mumkin.

**Q: Streaming qo'llab-quvvatlash kerakmi?**
A: Ha, katta response'lar uchun streaming juda foydali.

**Q: Cost'ni qanday nazorat qilish mumkin?**
A: Rate limiting, token limits va usage tracking orqali.

**Q: Frontend yoki Backend'da AI call qilish?**
A: Backend'da (API Route) - API key'lar xavfsiz bo'ladi va server-side validation mumkin.

---

**Yaratilgan:** 2024
**Versiya:** 1.0

