# Reply tugmalar

Klaviatura o'rnida ko'rinadigan tugmalar.

## Yaratish

1. Text Message node'ini tanlang
2. **Keyboard** bo'limini oching
3. **"Reply Keyboard"** tanlang
4. Tugmalar qo'shing

## Tugma xususiyatlari

### Matn

Tugmada ko'rinadigan va yuborilgan matn:
```
📱 Mahsulotlar
```

### Maxsus tugmalar

| Tugma | Vazifa |
|-------|--------|
| Request Contact | Telefon raqam so'rash |
| Request Location | Joylashuv so'rash |
| Request Poll | So'rovnoma so'rash |

## Keyboard sozlamalari

### Resize Keyboard

| Qiymat | Natija |
|--------|--------|
| ❌ | Standart o'lcham (katta) |
| ✅ | Kichikroq tugmalar |

### One Time Keyboard

| Qiymat | Natija |
|--------|--------|
| ❌ | Doim ko'rinadi |
| ✅ | Bosilganda yashirinadi |

### Selective

| Qiymat | Natija |
|--------|--------|
| ❌ | Hamma ko'radi |
| ✅ | Faqat belgilangan |

## Joylashuv

**2 qator, 1 tugma:**
```
┌───────────────────────────────┐
│         📱 Mahsulotlar        │
├───────────────────────────────┤
│           🛒 Savat            │
└───────────────────────────────┘
```

**1 qator, 2 tugma:**
```
┌───────────────┬───────────────┐
│  👤 Profil    │   ℹ️ Yordam   │
└───────────────┴───────────────┘
```

## Reply Button Trigger

### Oddiy tugma

```
┌─────────────────┐
│ Reply Button    │
│ Trigger         │
│ text: "📱       │
│ Mahsulotlar"    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Text Message   │
│ Mahsulotlar     │
│ ro'yxati...     │
└─────────────────┘
```

### Kontakt so'rash

```
┌─────────────────┐
│  Text Message   │
│ "Telefon yubor" │
│ [📱 Telefon    │
│  yuborish]      │
│ (request_contact│
│  = true)        │
└─────────────────┘
```

```
┌─────────────────┐
│ Message Trigger │
│ type: contact   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Telefon:        │
│ {{message.      │
│ contact.        │
│ phone_number}}  │
└─────────────────┘
```

### Joylashuv so'rash

```
┌─────────────────┐
│  Text Message   │
│ "Joylashuv     │
│  yuboring"      │
│ [📍 Joylashuv  │
│  yuborish]      │
│ (request_       │
│  location=true) │
└─────────────────┘
```

## Keyboard o'chirish

Keyboard'ni olib tashlash uchun:

```
┌─────────────────┐
│  Text Message   │
│ "Rahmat!"       │
│                 │
│ remove_keyboard │
│   = true        │
└─────────────────┘
```

## Misollar

### Asosiy menu

```
┌───────────────────────────────┐
│         📱 Mahsulotlar        │
├───────────────────────────────┤
│           🛒 Savat            │
├───────────────┬───────────────┤
│  👤 Profil    │   ℹ️ Yordam   │
└───────────────┴───────────────┘
```

### Ro'yxatdan o'tish

**1-qadam: Telefon**
```
┌───────────────────────────────┐
│    📱 Telefon yuborish        │
└───────────────────────────────┘
```

**2-qadam: Joylashuv**
```
┌───────────────────────────────┐
│    📍 Joylashuv yuborish      │
├───────────────────────────────┤
│         ⏭️ O'tkazish          │
└───────────────────────────────┘
```

### Ha/Yo'q

```
┌───────────────┬───────────────┐
│      ✅ Ha    │    ❌ Yo'q    │
└───────────────┴───────────────┘
```

## Inline vs Reply

| Inline | Reply |
|--------|-------|
| Xabar ichida | Klaviatura o'rnida |
| Callback yuboradi | Matn yuboradi |
| Xabarni tahrirlash | Yangi xabar yuborish |
| Bir martali tanlov | Doimiy menyu |

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- Asosiy menyu uchun Reply
- Doimiy funksiyalar uchun Reply
- Kontakt/joylashuv so'rash uchun Reply
- resize_keyboard = true

### ❌ Noto'g'ri

- Juda ko'p tugma (6+ qator)
- Juda uzun matn
- One time keyboard menyuda

## Keyingi

{% content-ref url="dinamik-tugmalar.md" %}
[dinamik-tugmalar.md](dinamik-tugmalar.md)
{% endcontent-ref %}
