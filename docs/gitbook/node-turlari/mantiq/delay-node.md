# Delay (Kutish)

Oqimni ma'lum vaqtga to'xtatadi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Mantiq |
| **Node nomi** | Delay |
| **Fayl** | `DelayNode/DelayNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   ⏱️ Delay      │
│   5 soniya      │
└────────┬────────┘
         ○ Source
```

## Xususiyatlar

### Duration (Davomiylik)

Kutish vaqti.

### Unit (Birlik)

| Birlik | Misol |
|--------|-------|
| Milliseconds | 500ms |
| Seconds | 5s |
| Minutes | 2m |
| Hours | 1h |

## Misollar

### Tabiiy pauza

"Yozmoqda..." effekti uchun:

```
┌─────────────────┐
│   Chat Action   │
│   typing        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Delay       │
│   2 soniya      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Text Message   │
│   Javob...      │
└─────────────────┘
```

### Rate limit

Ko'p xabar yuborishda:

```
┌─────────────────┐
│    For Loop     │
│   users         │
└────┬───────┬────┘
     │       │
   Body    Done
     │
     ▼
┌─────────────────┐
│  Text Message   │
│   to: item.id   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Delay       │
│   100ms         │
└─────────────────┘
```

### Countdown

Orqaga sanash:

```
Text: "3..."
    │
    ▼
Delay 1s
    │
    ▼
Edit: "2..."
    │
    ▼
Delay 1s
    │
    ▼
Edit: "1..."
    │
    ▼
Delay 1s
    │
    ▼
Edit: "Boshlandi! 🚀"
```

## Cheklovlar

{% hint style="warning" %}
Delay **bloklovchi** — oqim kutayotganda hech narsa bo'lmaydi.
{% endhint %}

**Maksimal tavsiya etilgan:** 5-10 soniya

Uzunroq kutish uchun:
- Cron Trigger ishlating
- Scheduled message (server-side)

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- Qisqa pauzalar (1-5 soniya)
- Chat Action bilan birga
- Rate limit uchun

### ❌ Noto'g'ri

- Juda uzun delay (1+ minut)
- Har bir xabar orasida
- Keraksiz joyda

## Keyingi

{% content-ref url="random-node.md" %}
[random-node.md](random-node.md)
{% endcontent-ref %}
