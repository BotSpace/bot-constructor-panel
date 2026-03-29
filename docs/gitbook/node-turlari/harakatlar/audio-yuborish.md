# Audio yuborish

Foydalanuvchiga audio fayl yuboradi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Harakat |
| **Node nomi** | Audio Message |
| **Fayl** | `AudioMessageNode/AudioMessageNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   🎵 Audio      │
│  Audio Message  │
└────────┬────────┘
         ○ Source
```

## Xususiyatlar

### Audio

Audio manbasi:

| Tur | Misol |
|-----|-------|
| URL | `https://example.com/song.mp3` |
| File ID | `CQACAgIAAxkBAAI...` |

### Caption (Izoh)

Audio ostidagi matn.

### Title (Sarlavha)

Audio nomi.

### Performer (Ijrochi)

Ijrochi yoki artist nomi.

### Duration (Davomiylik)

Davomiylik sekundlarda.

### Thumbnail

Muqova rasmi.

## Audio formatlari

- MP3 (tavsiya etiladi)
- M4A
- OGG (Opus codec bilan)

**Maksimal o'lcham:** 50 MB

## Voice vs Audio

| Audio Message | Voice Message |
|---------------|---------------|
| Musiqa fayli | Ovozli xabar |
| Title, Performer bor | Yo'q |
| Musiqa player | Ovozli xabar player |

## Misollar

### Musiqa fayli

**Audio:** `https://example.com/song.mp3`
**Title:** `Mening qo'shig'im`
**Performer:** `Artist nomi`

## Keyingi

{% content-ref url="fayl-yuborish.md" %}
[fayl-yuborish.md](fayl-yuborish.md)
{% endcontent-ref %}
