# Cron Trigger

Belgilangan **jadval bo'yicha** avtomatik ishlaydi. Foydalanuvchi harakati kerak emas.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Trigger |
| **Fayl** | `CronTriggerNode/CronTriggerNode.tsx` |
| **Handle'lar** | Target (tepa), Source (past) |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│  ⏰ Cron        │
│    Trigger      │
└────────┬────────┘
         ○ Source
```

## Qachon ishlatiladi?

| Vaziyat | Misol |
|---------|-------|
| Kunlik eslatma | Har kuni soat 9:00 da |
| Haftalik hisobot | Har dushanba 10:00 da |
| Soatlik tekshirish | Har soatda |
| Oylik xabar | Har oyning 1-kuni |

## Xususiyatlar

### Cron Expression

Cron ifodasi 5 ta qismdan iborat:

```
┌───────────── daqiqa (0-59)
│ ┌───────────── soat (0-23)
│ │ ┌───────────── oy kuni (1-31)
│ │ │ ┌───────────── oy (1-12)
│ │ │ │ ┌───────────── hafta kuni (0-7, 0 va 7 = Yakshanba)
│ │ │ │ │
* * * * *
```

### Maxsus belgilar

| Belgi | Ma'no | Misol |
|-------|-------|-------|
| `*` | Har bir | `* * * * *` = har daqiqa |
| `,` | Ro'yxat | `0,30 * * * *` = 0 va 30-daqiqalarda |
| `-` | Oraliq | `9-17 * * * *` = 9 dan 17 gacha |
| `/` | Qadam | `*/5 * * * *` = har 5 daqiqada |

## Misollar

### Tez-tez ishlatiladigan jadvallar

| Cron | Tavsif |
|------|--------|
| `0 9 * * *` | Har kuni soat 9:00 |
| `0 9 * * 1` | Har dushanba 9:00 |
| `0 9 1 * *` | Har oyning 1-kuni 9:00 |
| `*/30 * * * *` | Har 30 daqiqada |
| `0 */2 * * *` | Har 2 soatda |
| `0 9-18 * * 1-5` | Ish kunlari 9:00-18:00 har soatda |

### Kunlik eslatma

```
┌─────────────────┐
│  Cron Trigger   │
│   0 9 * * *     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Bugun navbatda: │
│ - Loyiha A      │
│ - Uchrashuv B   │
└─────────────────┘
```

**Cron:** `0 9 * * *` (Har kuni 9:00)

### Haftalik hisobot

```
┌─────────────────┐
│  Cron Trigger   │
│  0 10 * * 1     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Haftalik hisobot│
│ Savdo: $5000    │
│ Mijozlar: 120   │
└─────────────────┘
```

**Cron:** `0 10 * * 1` (Har dushanba 10:00)

### Soatlik tekshirish

```
┌─────────────────┐
│  Cron Trigger   │
│    0 * * * *    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HTTP Request   │
│ Server statusini│
│   tekshirish    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  If: xato bor?  │
├────────┬────────┤
   Ha       Yo'q
    │
    ▼
┌─────────────────┐
│ Adminga xabar   │
└─────────────────┘
```

**Cron:** `0 * * * *` (Har soatda)

## Kimga yuboriladi?

Cron Trigger'da **target** yo'q — ya'ni foydalanuvchi harakati yo'q. Xabarni kimga yuborish kerakligini siz belgilaysiz:

### 1. Barcha foydalanuvchilarga

Collection (foydalanuvchilar ro'yxati) + For Loop:

```
┌─────────────────┐
│  Cron Trigger   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Load Collection │
│   "users"       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   For Loop      │
│ har bir user    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Send Message   │
│ to: user.id     │
└─────────────────┘
```

### 2. Faqat adminlarga

```
┌─────────────────┐
│  Cron Trigger   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Send to Admin   │
│ Hisobot...      │
└─────────────────┘
```

### 3. Belgilangan chat'ga

```
┌─────────────────┐
│  Cron Trigger   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Text Message   │
│ chat_id: -100...│
└─────────────────┘
```

## Vaqt mintaqasi

{% hint style="warning" %}
Cron Trigger **server vaqtida** ishlaydi. Server vaqti UTC bo'lishi mumkin.
{% endhint %}

Toshkent vaqti = UTC+5

| Toshkent | UTC | Cron |
|----------|-----|------|
| 9:00 | 4:00 | `0 4 * * *` |
| 12:00 | 7:00 | `0 7 * * *` |
| 18:00 | 13:00 | `0 13 * * *` |

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- Cron'ni sinab ko'ring — avval har daqiqa, keyin haqiqiy jadval
- Target chat_id'ni to'g'ri belgilang
- Server vaqt mintaqasini hisobga oling

### ❌ Noto'g'ri

- Juda tez-tez cron ishlatmang — Telegram cheklovlariga urilishingiz mumkin
- Katta foydalanuvchilar soniga bir vaqtda xabar yuborish sekin bo'ladi

## Keyingi

{% content-ref url="../harakatlar/" %}
[harakatlar](../harakatlar/)
{% endcontent-ref %}
