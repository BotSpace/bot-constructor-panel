# Callback Query Trigger

Foydalanuvchi **inline tugma** bosganda ishlaydi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Trigger |
| **Fayl** | `CallbackQueryTrigger/CallbackQueryTrigger.tsx` |
| **Handle'lar** | Target (tepa), Source (past) |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│ Callback Query  │
│    Trigger      │
└────────┬────────┘
         ○ Source
```

## Inline tugmalar nima?

Inline tugmalar — bu xabar ichida joylashgan tugmalar. Foydalanuvchi bosganda Telegram botga **callback query** yuboradi.

```
┌─────────────────────────┐
│  Mahsulotlar ro'yxati   │
├─────────────┬───────────┤
│  📱 iPhone  │ 💻 MacBook│
├─────────────┴───────────┤
│      🛒 Savat           │
└─────────────────────────┘
```

Har bir tugmada **callback_data** bor — bu tugma bosilganda yuboriladigan maxfiy qiymat.

## Xususiyatlar

### Filter (Filtr)

| Filtr | Tavsif |
|-------|--------|
| `any` | Har qanday inline tugma |
| `equals` | Aynan shu callback_data |
| `regex` | Regular expression |
| `collection` | Kolleksiyadan dinamik |

### Context Value

Filtr qiymati:

| Filtr | Value misoli |
|-------|--------------|
| `equals` | `buy_iphone` |
| `regex` | `^product_[0-9]+$` |

### Global

| Qiymat | Ishlash |
|--------|---------|
| ❌ O'chirilgan | Faqat joriy State'da |
| ✅ Yoqilgan | Har qanday State'da |

## Misollar

### Oddiy tugma

**Text Message node'da:**
```
Nimani xohlaysiz?
```
**Tugmalar:**
| Matn | Callback Data |
|------|---------------|
| Mahsulotlar | `products` |
| Yordam | `help` |

**Callback Query Trigger:**
```
┌─────────────────┐
│ Callback Query  │
│ filter: equals  │
│ value: products │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Mahsulotlar:    │
│ 1. iPhone       │
│ 2. MacBook      │
└─────────────────┘
```

### Dinamik callback_data

Agar callback_data'da o'zgaruvchi qiymat bo'lsa, regex ishlating:

```
callback_data: product_123
callback_data: product_456
callback_data: product_789
```

**Regex:** `^product_([0-9]+)$`

```
┌─────────────────┐
│ Callback Query  │
│  filter: regex  │
│ ^product_[0-9]+$│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Custom Code   │
│ product_id ni   │
│ ajratib olish   │
└─────────────────┘
```

### Aqlli tugma tanlash

Callback Query Trigger **oldingi node'dagi tugmalarni** ko'ra oladi. Agar trigger oldingi Text Message'ga ulangan bo'lsa, siz tugmalarni dropdown'dan tanlashingiz mumkin.

## O'zgaruvchilar

Callback Query ishlaganda:

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{callback.data}}` | Callback data qiymati |
| `{{callback.id}}` | Callback query ID |
| `{{callback.message_id}}` | Xabar ID (tugma joylashgan) |
| `{{user.id}}` | Foydalanuvchi ID |

## Callback Answer

Callback Query'ga javob berilishi kerak — aks holda Telegram tugma ustida loading ko'rsatadi.

**Callback Answer node** yordamida:

```
┌─────────────────┐
│ Callback Query  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Callback Answer │
│ text: "Tanlandi"│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Edit Message   │
│ Yangi matn...   │
└─────────────────┘
```

{% hint style="warning" %}
Callback Query'ga 10 soniya ichida javob berilishi kerak!
{% endhint %}

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- Har bir Callback Query'ga **Callback Answer** qo'shing
- Tugma bosilgandan keyin xabarni tahrirlang (Edit Message)
- Callback data'ni qisqa va tushunarli qiling

### ❌ Noto'g'ri

- Callback Answer'siz qoldirmang — foydalanuvchi loading ko'radi
- Callback data'ni 64 baytdan oshirmang (Telegram cheklovi)

## Keyingi

{% content-ref url="reply-button.md" %}
[reply-button.md](reply-button.md)
{% endcontent-ref %}
