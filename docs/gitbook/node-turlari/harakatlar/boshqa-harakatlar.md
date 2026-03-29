# Boshqa harakatlar

Qo'shimcha harakat node'lari.

## Forward Message

Xabarni boshqa chat'ga yo'naltirish.

### Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| **From Chat ID** | Xabar joylashgan chat |
| **Message ID** | Yo'naltiriladigan xabar ID |
| **To Chat ID** | Manzil chat |

### Misol

```
┌─────────────────┐
│ Forward Message │
│ from: {{chat.id}}│
│ msg: {{message.id}}│
│ to: -100123456  │
└─────────────────┘
```

---

## Copy Message

Xabarni nusxalash (forward belgisisiz).

### Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| **From Chat ID** | Xabar joylashgan chat |
| **Message ID** | Nusxalanadigan xabar ID |
| **To Chat ID** | Manzil chat |
| **Caption** | Yangi izoh (ixtiyoriy) |

---

## Pin Message

Xabarni chat'da mahkamlash.

### Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| **Chat ID** | Chat |
| **Message ID** | Mahkamlanadigan xabar |
| **Disable notification** | Ovozsiz mahkamlash |

---

## Unpin Message

Mahkamlangan xabarni echish.

### Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| **Chat ID** | Chat |
| **Message ID** | Echiladigan xabar (bo'sh = hammasi) |

---

## Send to Admin

Adminga xabar yuborish.

### Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| **Text** | Xabar matni |
| **Admin ID** | Admin foydalanuvchi ID |

### Misol

```
┌─────────────────┐
│  Send to Admin  │
│ "Yangi buyurtma │
│  #{order.id}"   │
└─────────────────┘
```

---

## Sticker

Stiker yuborish.

### Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| **Sticker** | File ID yoki URL |

---

## Animation

GIF yoki animatsiya yuborish.

### Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| **Animation** | File ID yoki URL |
| **Caption** | Izoh |
| **Duration** | Davomiylik |
| **Width, Height** | O'lchamlar |

---

## Voice

Ovozli xabar yuborish.

### Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| **Voice** | Audio fayl (OGG/Opus) |
| **Caption** | Izoh |
| **Duration** | Davomiylik |

---

## Video Note

Dumaloq video xabar yuborish.

### Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| **Video Note** | Video fayl |
| **Duration** | Davomiylik |
| **Length** | Video o'lchami (kvadrat) |

---

## Poll

So'rovnoma yuborish.

### Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| **Question** | Savol |
| **Options** | Javob variantlari |
| **Is Anonymous** | Anonim so'rovnoma |
| **Type** | `regular` yoki `quiz` |
| **Allows Multiple** | Ko'p tanlov |

### Misol

**Question:** `Qaysi dasturlash tilini yaxshi ko'rasiz?`

**Options:**
- Python
- JavaScript
- TypeScript
- Go

---

## Dice

Emoji o'yini (zar, slot, bowling va h.k.)

### Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| **Emoji** | 🎲, 🎯, 🏀, ⚽, 🎰, 🎳 |

Telegram tasodifiy natija beradi va animatsiya ko'rsatadi.

---

## Media Group

Bir nechta media (rasm/video) birga yuborish.

### Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| **Media** | Media ro'yxati (2-10 ta) |

---

## Chat Action

"Yozmoqda...", "Rasm yubormoqda..." kabi statusni ko'rsatish.

### Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| **Action** | Harakat turi |

### Action turlari

| Action | Ko'rinishi |
|--------|-----------|
| `typing` | Yozmoqda... |
| `upload_photo` | Rasm yubormoqda... |
| `upload_video` | Video yubormoqda... |
| `upload_audio` | Audio yubormoqda... |
| `upload_document` | Fayl yubormoqda... |
| `find_location` | Joylashuv qidirmoqda... |
| `record_voice` | Ovoz yozmoqda... |
| `record_video` | Video yozmoqda... |

### Misol

```
┌─────────────────┐
│  Chat Action    │
│ action: typing  │
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
│  Javob...       │
└─────────────────┘
```

## Keyingi

{% content-ref url="../mantiq/" %}
[mantiq](../mantiq/)
{% endcontent-ref %}
