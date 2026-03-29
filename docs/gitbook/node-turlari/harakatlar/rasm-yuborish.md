# Rasm yuborish

Foydalanuvchiga rasm yuboradi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Harakat |
| **Node nomi** | Photo Message |
| **Fayl** | `PhotoMessageNode/PhotoMessageNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   🖼️ Rasm       │
│  Photo Message  │
└────────┬────────┘
         ○ Source
```

## Xususiyatlar

### Photo (Rasm)

Rasm manbasi:

| Tur | Misol |
|-----|-------|
| URL | `https://example.com/image.jpg` |
| File ID | `AgACAgIAAxkBAAI...` |
| O'zgaruvchi | `{{message.photo.file_id}}` |

{% hint style="info" %}
**File ID** — Telegram'da oldin yuborilgan rasmning identifikatori. Qayta ishlatish tezroq.
{% endhint %}

### Caption (Izoh)

Rasm ostidagi matn. O'zgaruvchilar ishlatish mumkin.

**Maksimal uzunlik:** 1024 belgi

### Parse Mode

Izoh matnini formatlash:
- Yo'q
- HTML
- Markdown
- MarkdownV2

### Keyboard

Rasm bilan birga tugmalar yuborish mumkin.

### Spoiler

| Qiymat | Natija |
|--------|--------|
| ❌ O'chirilgan | Oddiy rasm |
| ✅ Yoqilgan | Blur effektli (ochish kerak) |

### Chat ID, Reply To, Notification

Boshqa xabar node'laridagi kabi.

## Misollar

### URL orqali

**Photo:** `https://example.com/product.jpg`

**Caption:**
```
iPhone 15 Pro
Narxi: $999
```

### File ID orqali

**Photo:** `{{message.photo.file_id}}`

**Caption:**
```
Sizning rasmingiz qabul qilindi ✅
```

### Spoiler bilan

**Photo:** `https://example.com/surprise.jpg`
**Spoiler:** ✅
**Caption:**
```
Ochish uchun bosing 👀
```

## Rasm formatlari

Telegram quyidagi formatlarni qo'llab-quvvatlaydi:
- JPEG
- PNG
- GIF (animatsiya uchun Animation node ishlating)
- WebP

**Maksimal o'lcham:** 10 MB

## O'zgaruvchilar

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.photo.file_id}}` | Kelgan rasm ID |
| `{{var.image_url}}` | Custom URL |

## Keyingi

{% content-ref url="video-yuborish.md" %}
[video-yuborish.md](video-yuborish.md)
{% endcontent-ref %}
