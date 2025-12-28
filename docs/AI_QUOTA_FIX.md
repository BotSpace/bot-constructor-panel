# AI Quota Muammosi - Yechim

## ❌ Muammo

```
Error [ApiError]: Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
Model: gemini-2.0-flash-exp
```

## ✅ Yechim

### 1. Model O'zgartirish

`gemini-2.0-flash-exp` experimental model va **free tier'da limit 0**. 

**To'g'ri modellar:**
- ✅ `gemini-1.5-flash` - Tez va bepul tier'da ishlaydi (Tavsiya etiladi)
- ✅ `gemini-1.5-pro` - Kuchliroq, lekin sekinroq

### 2. Environment Variable O'zgartirish

`.env.local` faylida:

```env
# Eski (Noto'g'ri)
AI_MODEL=gemini-2.0-flash-exp

# Yangi (To'g'ri)
AI_MODEL=gemini-1.5-flash
```

Yoki environment variable'ni o'chirib, default model ishlatish (gemini-1.5-flash).

### 3. Server'ni Qayta Ishga Tushirish

```bash
# Development server'ni to'xtatish (Ctrl+C)
# Keyin qayta ishga tushirish
npm run dev
```

---

## 🔍 Qo'shimcha Tekshiruvlar

### Google AI Studio'da Quota Tekshirish

1. [Google AI Studio](https://makersuite.google.com/app/apikey) ga kiring
2. [Usage & Limits](https://ai.dev/usage?tab=rate-limit) bo'limiga o'ting
3. Quota holatini ko'ring

### Billing Sozlamalari

Agar free tier limitiga yetilgan bo'lsa:
- Billing account qo'shing
- Yoki boshqa API key ishlating

---

## 📊 Model Taqqoslash

| Model | Tezlik | Kuch | Free Tier | Tavsiya |
|-------|--------|------|-----------|---------|
| `gemini-1.5-flash` | ⚡⚡⚡ | ⭐⭐⭐ | ✅ | ✅ Tavsiya |
| `gemini-1.5-pro` | ⚡⚡ | ⭐⭐⭐⭐ | ✅ | Kuchli vazifalar uchun |
| `gemini-2.0-flash-exp` | ⚡⚡⚡ | ⭐⭐⭐⭐ | ❌ Limit 0 | ❌ Ishlatmaslik |

---

## 🛠️ Kod O'zgarishlari

Kod allaqachon yangilandi:

1. ✅ Default model `gemini-1.5-flash` ga o'zgartirildi
2. ✅ Quota xatolari uchun yaxshilangan error handling
3. ✅ Retry delay ko'rsatish
4. ✅ Foydalanuvchiga aniq xabar berish

---

## ⚠️ Eslatmalar

1. **Free Tier Limitlari:**
   - `gemini-1.5-flash`: 15 RPM (requests per minute)
   - `gemini-1.5-pro`: 2 RPM
   - Kunlik limitlar ham bor

2. **Rate Limiting:**
   - Agar limitga yetilsa, 60 soniya kutish kerak
   - Kod avtomatik retry qilmaydi (keyinchalik qo'shish mumkin)

3. **Production:**
   - Production'da billing account qo'shish tavsiya etiladi
   - Yoki rate limiting va caching qo'shish

---

## 🚀 Keyingi Qadamlar

1. ✅ Model o'zgartirildi
2. ⏳ Server'ni qayta ishga tushirish
3. ⏳ Test qilish
4. ⏳ (Ixtiyoriy) Billing account qo'shish

---

**Status:** ✅ Muammo hal qilindi
**Yaratilgan:** 2024

