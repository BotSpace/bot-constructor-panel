# Video yuborish

Foydalanuvchiga video yuboradi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Harakat |
| **Node nomi** | Video Message |
| **Fayl** | `VideoMessageNode/VideoMessageNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   🎬 Video      │
│  Video Message  │
└────────┬────────┘
         ○ Source
```

## Xususiyatlar

### Video

Video manbasi:

| Tur | Misol |
|-----|-------|
| URL | `https://example.com/video.mp4` |
| File ID | `BAACAgIAAxkBAAI...` |
| O'zgaruvchi | `{{message.video.file_id}}` |

### Caption (Izoh)

Video ostidagi matn.

**Maksimal uzunlik:** 1024 belgi

### Thumbnail (Eskiz)

Video eskiz rasmi (ixtiyoriy).

### Duration (Davomiylik)

Video davomiyligi sekundlarda (ixtiyoriy).

### Width, Height

Video o'lchamlari pikselda (ixtiyoriy).

### Supports Streaming

| Qiymat | Natija |
|--------|--------|
| ❌ | To'liq yuklanganidan keyin |
| ✅ | Streaming orqali ko'rish |

### Spoiler

Blur effekt bilan yashirish.

## Video formatlari

- MP4 (tavsiya etiladi)
- Boshqa formatlar konvertatsiya qilinishi mumkin

**Maksimal o'lcham:** 50 MB (bot orqali)

## Misollar

### Oddiy video

**Video:** `https://example.com/tutorial.mp4`

**Caption:**
```
Bot yaratish bo'yicha qo'llanma 📺
```

### Streaming bilan

**Video:** `https://example.com/long-video.mp4`
**Supports Streaming:** ✅

## Keyingi

{% content-ref url="audio-yuborish.md" %}
[audio-yuborish.md](audio-yuborish.md)
{% endcontent-ref %}
