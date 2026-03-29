# Harakatlar

**Harakat (Action)** — bu bot bajaradigan amal. Xabar yuborish, tahrirlash, o'chirish va boshqa operatsiyalar.

## Harakat turlari

### Xabar yuborish

| Node | Tavsif |
|------|--------|
| [Text Message](matn-yuborish.md) | Matn xabari |
| [Photo Message](rasm-yuborish.md) | Rasm |
| [Video Message](video-yuborish.md) | Video |
| [Audio Message](audio-yuborish.md) | Audio fayl |
| [File Message](fayl-yuborish.md) | Hujjat |
| [Location](joylashuv-yuborish.md) | Joylashuv |
| [Contact](kontakt-yuborish.md) | Kontakt |

### Xabar bilan ishlash

| Node | Tavsif |
|------|--------|
| [Edit Message](xabar-tahrirlash.md) | Tahrirlash |
| [Delete Message](xabar-ochirish.md) | O'chirish |
| [Boshqalar...](boshqa-harakatlar.md) | Forward, Pin, Copy... |

## Umumiy xususiyatlar

Barcha xabar node'larida quyidagi umumiy sozlamalar bor:

### Chat ID

Kimga yuboriladi:
- Bo'sh qoldiring → joriy foydalanuvchiga
- `{{user.id}}` → joriy foydalanuvchiga
- Raqam → aniq chat ID'ga

### Reply to message

Qaysi xabarga javob sifatida:
- Bo'sh → oddiy xabar
- `{{message.id}}` → kelgan xabarga javob

### Keyboard

Tugmalar qo'shish:
- **Inline keyboard** — xabar ichida
- **Reply keyboard** — klaviatura o'rnida
- **Remove keyboard** — reply keyboard'ni o'chirish

### Parse mode

Matn formatlash:
| Rejim | Misol |
|-------|-------|
| Yo'q | Oddiy matn |
| HTML | `<b>qalin</b>` |
| Markdown | `*qalin*` |
| MarkdownV2 | `*qalin*` (kengaytirilgan) |

### Disable notification

| Qiymat | Natija |
|--------|--------|
| ❌ | Ovozli bildirishnoma |
| ✅ | Ovozsiz (silent) |

### Disable web preview

| Qiymat | Natija |
|--------|--------|
| ❌ | Havola preview ko'rinadi |
| ✅ | Preview yo'q |

## Handle'lar

Barcha harakat node'larida:

```
       ○ Target (kirish)
┌─────────────────┐
│     Action      │
└────────┬────────┘
         ○ Source (chiqish)
```

## O'zgaruvchilar ishlatish

Matn va boshqa maydonlarda o'zgaruvchilar ishlatishingiz mumkin:

```
Salom, {{user.first_name}}!

Sizning ID: {{user.id}}
Xabar: {{message.text}}
```

### Mavjud o'zgaruvchilar

| Guruh | O'zgaruvchilar |
|-------|----------------|
| Foydalanuvchi | `user.id`, `user.first_name`, `user.last_name`, `user.username` |
| Xabar | `message.id`, `message.text`, `message.type` |
| Chat | `chat.id`, `chat.type`, `chat.title` |
| Trigger | `trigger.command`, `trigger.args`, `callback.data` |

## Xatolik boshqarish

Agar xabar yuborish muvaffaqiyatsiz bo'lsa:
- Foydalanuvchi botni bloklagan
- Chat mavjud emas
- Bot chat'dan chiqarilgan

{% hint style="warning" %}
Xatoliklar oqimni to'xtatmaydi, lekin keyingi node'lar ishlamasligi mumkin.
{% endhint %}

## Keyingi

{% content-ref url="matn-yuborish.md" %}
[matn-yuborish.md](matn-yuborish.md)
{% endcontent-ref %}
