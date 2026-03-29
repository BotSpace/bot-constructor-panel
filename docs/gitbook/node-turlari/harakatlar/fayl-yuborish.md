# Fayl yuborish

Foydalanuvchiga har qanday turdagi fayl yuboradi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Harakat |
| **Node nomi** | File Message (Document) |
| **Fayl** | `FileMessageNode/FileMessageNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   📄 Fayl       │
│  File Message   │
└────────┬────────┘
         ○ Source
```

## Xususiyatlar

### Document (Fayl)

Fayl manbasi:

| Tur | Misol |
|-----|-------|
| URL | `https://example.com/file.pdf` |
| File ID | `BQACAgIAAxkBAAI...` |

### Caption (Izoh)

Fayl ostidagi matn.

### Filename (Fayl nomi)

Foydalanuvchi ko'radigan fayl nomi (ixtiyoriy).

### Thumbnail

Fayl eskizi (ixtiyoriy).

## Fayl turlari

Telegram har qanday fayl turini qo'llab-quvvatlaydi:
- PDF
- DOCX, XLSX, PPTX
- ZIP, RAR
- APK
- va boshqalar

**Maksimal o'lcham:** 50 MB (bot orqali)

## Misollar

### PDF yuborish

**Document:** `https://example.com/manual.pdf`
**Filename:** `Qo'llanma.pdf`
**Caption:**
```
Bot yaratish qo'llanmasi 📚
```

### Kelgan faylni qayta yuborish

**Document:** `{{message.document.file_id}}`

## O'zgaruvchilar

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.document.file_id}}` | Kelgan fayl ID |
| `{{message.document.file_name}}` | Fayl nomi |
| `{{message.document.mime_type}}` | MIME turi |

## Keyingi

{% content-ref url="joylashuv-yuborish.md" %}
[joylashuv-yuborish.md](joylashuv-yuborish.md)
{% endcontent-ref %}
