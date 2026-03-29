# Triggerlar

**Trigger** — bu botni ishga tushiruvchi hodisa. Har bir oqim (flow) trigger bilan boshlanadi.

## Trigger turlari

| Trigger | Qachon ishlaydi |
|---------|-----------------|
| [Command Trigger](command-trigger.md) | Foydalanuvchi buyruq yuborganda (`/start`) |
| [Message Trigger](message-trigger.md) | Foydalanuvchi xabar yuborganda |
| [Callback Query](callback-query.md) | Inline tugma bosilganda |
| [Reply Button](reply-button.md) | Reply tugma bosilganda |
| [Cron Trigger](cron-trigger.md) | Belgilangan vaqtda |

## Triggerlar qanday ishlaydi?

```
Foydalanuvchi harakati
        │
        ▼
┌───────────────────┐
│     Trigger       │ ← Bot signalni ushlaydi
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Keyingi node'lar │ ← Oqim davom etadi
└───────────────────┘
```

## Trigger xususiyatlari

### Target handle

Barcha triggerlarda **target handle** (tepa) bor. Bu:
- State node'dan kelish uchun
- SubFlow orqali chaqirish uchun

### Source handle

Barcha triggerlarda **source handle** (past) bor — keyingi node'ga o'tish uchun.

### Global flag

Ko'pchilik triggerlarda **global** bayrog'i bor:

| Global | Ishlash |
|--------|---------|
| ❌ O'chirilgan | Faqat shu State'da ishlaydi |
| ✅ Yoqilgan | Har qanday State'da ishlaydi |

{% hint style="info" %}
Global trigger'lar odatda `/cancel`, `/help` kabi universal buyruqlar uchun ishlatiladi.
{% endhint %}

## Bir nechta trigger

Bitta oqimda bir nechta trigger bo'lishi mumkin:

```
┌──────────────┐   ┌──────────────┐
│   /start     │   │   /help      │
│   Command    │   │   Command    │
└──────┬───────┘   └──────┬───────┘
       │                  │
       └────────┬─────────┘
                │
                ▼
        ┌───────────────┐
        │  Salom xabar  │
        └───────────────┘
```

## Trigger tanlash

| Vaziyat | Trigger |
|---------|---------|
| Buyruqqa javob berish | Command Trigger |
| Xabar turiga qarab | Message Trigger |
| Inline tugma bosilganda | Callback Query |
| Reply tugma bosilganda | Reply Button |
| Har kuni soat 9:00 da | Cron Trigger |

## Keyingi

{% content-ref url="command-trigger.md" %}
[command-trigger.md](command-trigger.md)
{% endcontent-ref %}
