# Reply Button Trigger

Foydalanuvchi **reply keyboard** tugmasini bosganda ishlaydi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Trigger |
| **Fayl** | `ReplyButtonTrigger/ReplyButtonTrigger.tsx` |
| **Handle'lar** | Target (tepa), Source (past), Else (o'ng) |

## Ko'rinishi

```
         ○ Target
┌─────────────────┐
│ Reply Button    │
│    Trigger      │ ○ Else
└────────┬────────┘
         ○ Source
```

## Reply keyboard nima?

Reply keyboard — bu telefon klaviaturasi o'rnida ko'rinadigan tugmalar. Foydalanuvchi bosganda tugma matni xabar sifatida yuboriladi.

```
┌───────────────────────────────┐
│   📱 Mahsulotlar              │
├───────────────────────────────┤
│   🛒 Savat                    │
├───────────────────────────────┤
│   👤 Profil    │ ℹ️ Yordam    │
└───────────────────────────────┘
```

## Inline vs Reply

| Xususiyat | Inline tugmalar | Reply tugmalar |
|-----------|-----------------|----------------|
| Joylashuvi | Xabar ichida | Klaviatura o'rnida |
| Bosilganda | Callback yuboriladi | Matn yuboriladi |
| Ko'rinishi | Kichik | Katta |
| Trigger | Callback Query | Reply Button |

## Xususiyatlar

### Filter (Filtr)

| Filtr | Tavsif |
|-------|--------|
| `any` | Har qanday reply tugma |
| `equals` | Aynan shu matn |
| `contains` | Ichida shu so'z bor |
| `regex` | Regular expression |

### Context Value

Filtr qiymati (tugma matni):

| Filtr | Value misoli |
|-------|--------------|
| `equals` | `📱 Mahsulotlar` |
| `contains` | `Mahsulot` |

### Global

| Qiymat | Ishlash |
|--------|---------|
| ❌ O'chirilgan | Faqat joriy State'da |
| ✅ Yoqilgan | Har qanday State'da |

## Misollar

### Asosiy menu

**Text Message** da reply keyboard yarating:

```
Asosiy menu:
```

**Tugmalar:**
```
📱 Mahsulotlar | 🛒 Savat
👤 Profil      | ℹ️ Yordam
```

**Reply Button Trigger:**
```
┌─────────────────┐
│ Reply Button    │
│ filter: equals  │
│📱 Mahsulotlar   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Mahsulotlar:    │
│ 1. iPhone       │
│ 2. MacBook      │
└─────────────────┘
```

### Else handle

Foydalanuvchi noto'g'ri tugma bosganida:

```
┌─────────────────┐
│ Reply Button    │
│ filter: equals  │
│📱 Mahsulotlar   │────────┐
└────────┬────────┘        │
         │                 │ Else
         ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│ Mahsulotlar     │ │ Iltimos, tugma  │
│ ro'yxati...     │ │ tanlang 👇      │
└─────────────────┘ └─────────────────┘
```

### Kontakt so'rash

Reply keyboard'da maxsus tugmalar bor:

```
┌─────────────────┐
│ Reply Button    │
│ type: contact   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Rahmat! Telefon │
│{{contact.phone}}│
└─────────────────┘
```

### Joylashuv so'rash

```
┌─────────────────┐
│ Reply Button    │
│ type: location  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Joylashuvingiz: │
│ {{location}}    │
└─────────────────┘
```

## O'zgaruvchilar

Reply Button ishlaganda:

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.text}}` | Tugma matni |
| `{{user.id}}` | Foydalanuvchi ID |

### Kontakt tugmasi uchun

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.contact.phone_number}}` | Telefon |
| `{{message.contact.first_name}}` | Ism |

### Joylashuv tugmasi uchun

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.location.latitude}}` | Kenglik |
| `{{message.location.longitude}}` | Uzunlik |

## Reply keyboard yaratish

Text Message yoki boshqa xabar node'larida:

1. **Keyboard** bo'limini oching
2. **Reply Keyboard** tanlang
3. Tugmalar qo'shing
4. Sozlamalarni belgilang:

| Sozlama | Tavsif |
|---------|--------|
| One time | Bosilgandan keyin yashirish |
| Resize | Tugmalar kichikroq |
| Selective | Faqat ayrim foydalanuvchilarga |

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- Emoji bilan tugmalarni ajratib ko'rsating
- Har bir Reply Button Trigger'ga Else handle qo'shing
- One time keyboard'dan menu uchun foydalanmang

### ❌ Noto'g'ri

- Juda ko'p tugma qo'ymang (4-6 ta optimal)
- Tugma matnini juda uzun qilmang

## Keyingi

{% content-ref url="cron-trigger.md" %}
[cron-trigger.md](cron-trigger.md)
{% endcontent-ref %}
