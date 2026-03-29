# Xatolar va yechimlar

Tez-tez uchraydigan xatolar va ularni hal qilish usullari.

## Bot ishlamayapti

### Sabab 1: Token noto'g'ri

**Alomatlar:**
- Bot xabarlarga javob bermaydi
- Konsol'da "Unauthorized" xatosi

**Yechim:**
1. BotFather'da tokenni tekshiring
2. Token to'g'ri kiritilganligiga ishonch hosil qiling
3. Yangi token yarating

### Sabab 2: Trigger yo'q

**Alomatlar:**
- Oqim saqlangan, lekin bot javob bermaydi

**Yechim:**
1. Oqimda kamida bitta Trigger borligini tekshiring
2. Trigger'dan keyingi node'lar ulangan bo'lishi kerak

### Sabab 3: Global emas trigger

**Alomatlar:**
- Bot faqat ba'zi holatlarda ishlaydi

**Yechim:**
1. `/start` va `/cancel` trigger'larini **Global** qiling
2. Yoki foydalanuvchi holatini tekshiring

---

## Xabar yuborilmaydi

### Xato: "Chat not found"

**Sabab:** Foydalanuvchi botni bloklagan yoki chat mavjud emas.

**Yechim:**
- Try/catch bilan xatolikni ushlang
- Foydalanuvchini aktiv emas deb belgilang

### Xato: "Message is too long"

**Sabab:** Xabar 4096 belgidan uzun.

**Yechim:**
- Xabarni qisqartiring
- Yoki bir nechta xabarga bo'ling

### Xato: "Can't parse entities"

**Sabab:** HTML yoki Markdown sintaksis xatosi.

**Yechim:**
- Teglarni tekshiring
- Maxsus belgilarni escape qiling

---

## Inline tugmalar ishlamayapti

### Xato: Tugma bosilganda hech narsa bo'lmaydi

**Sabab:** Callback Query Trigger yo'q.

**Yechim:**
1. Callback Query Trigger qo'shing
2. Callback data'ni to'g'ri belgilang
3. Callback Answer qo'shing

### Xato: Loading aylanib turadi

**Sabab:** Callback Answer qo'shilmagan.

**Yechim:**
- Har bir Callback Query'dan keyin Callback Answer qo'shing

---

## HTTP Request xatolari

### Xato: "Connection timeout"

**Sabab:** Server javob bermaydi.

**Yechim:**
- API URL'ni tekshiring
- Timeout vaqtini oshiring
- Error handle qo'shing

### Xato: "Invalid JSON"

**Sabab:** Javob JSON formatda emas.

**Yechim:**
- API javobini tekshiring
- Content-Type headerini tekshiring

### Xato: "401 Unauthorized"

**Sabab:** API kaliti noto'g'ri.

**Yechim:**
- API kalitini tekshiring
- Authorization headerini to'g'ri formatlang

---

## Custom Code xatolari

### Xato: "Timeout exceeded"

**Sabab:** Kod 30 soniyadan ko'p ishladi.

**Yechim:**
- Kodni optimizatsiya qiling
- Katta ma'lumotlarni bo'lib ishlang
- Cheksiz tsikllarni oldini oling

### Xato: "Module not found"

**Sabab:** Kutubxona mavjud emas.

**Yechim:**
- Faqat mavjud kutubxonalarni ishlating
- Mavjud: requests, json, datetime, re, random, math

### Xato: "NameError"

**Sabab:** O'zgaruvchi aniqlanmagan.

**Yechim:**
- O'zgaruvchi nomini tekshiring
- `get_var()` bilan olish kerak

---

## State xatolari

### Xato: Foydalanuvchi noto'g'ri State'da

**Sabab:** State yangilanmagan.

**Yechim:**
- Har bir oqim oxirida State node qo'shing
- Global trigger'lardan keyin State'ni tekshiring

### Xato: State ma'lumotlari yo'qoldi

**Sabab:** State qayta yozilgan.

**Yechim:**
- State Data'da kerakli ma'lumotlarni saqlang
- State'ni to'liq qayta yozmasdan yangilang

---

## Kolleksiya xatolari

### Xato: "Collection not found"

**Sabab:** Kolleksiya nomi noto'g'ri.

**Yechim:**
- Kolleksiya nomini tekshiring
- Kolleksiya mavjudligini tekshiring

### Xato: Element topilmadi

**Sabab:** Filter noto'g'ri.

**Yechim:**
- Filter shartini tekshiring
- Element ID'sini tekshiring

---

## Umumiy maslahatlar

### Debugging

1. **Console'ni tekshiring** — brauzer konsolida xatoliklarni ko'ring
2. **Log yozing** — Custom Code'da `log()` funksiyasi
3. **Qadam-baqadam test** — har bir node'ni alohida sinang

### Oldini olish

1. **Tez-tez saqlang** — `Ctrl+S`
2. **Xatolik handle'larini qo'shing** — Else, Error yo'llari
3. **Ma'lumotlarni tekshiring** — kiritishdan oldin validate

### Yordam olish

1. Dokumentatsiyani o'qing
2. FAQ bo'limini ko'ring
3. Qo'llab-quvvatlash bilan bog'laning
