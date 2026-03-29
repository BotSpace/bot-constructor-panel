# Message Trigger

Foydalanuvchi har xil turdagi xabar yuborganda ishlaydi: matn, rasm, video, hujjat, joylashuv, kontakt va h.k.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Trigger |
| **Fayl** | `MessageTrigger/MessageTrigger.tsx` |
| **Handle'lar** | Target (tepa), Source (past), Else (o'ng) |

## Ko'rinishi

```
         ○ Target
┌─────────────────┐
│ Message Trigger │ ○ Else
└────────┬────────┘
         ○ Source
```

## Handle'lar

| Handle | Pozitsiya | Vazifa |
|--------|-----------|--------|
| Target | Tepa | Kirish (oldingi node'dan) |
| Source | Past | Chiqish (xabar mos kelganda) |
| Else | O'ng | Chiqish (xabar mos kelmasa) |

## Xususiyatlar

### Type (Xabar turi)

| Tur | Tavsif |
|-----|--------|
| `any` | Har qanday xabar |
| `text` | Faqat matn |
| `photo` | Rasm |
| `video` | Video |
| `audio` | Audio fayl |
| `voice` | Ovozli xabar |
| `video_note` | Video xabar (dumaloq) |
| `document` | Hujjat (fayl) |
| `sticker` | Stiker |
| `location` | Joylashuv |
| `contact` | Kontakt |
| `poll` | So'rovnoma |

### Filter (Filtr)

Faqat `text` turi uchun qo'shimcha filtr:

| Filtr | Tavsif |
|-------|--------|
| `any` | Har qanday matn |
| `equals` | Aynan shu matn |
| `contains` | Ichida shu so'z bor |
| `starts_with` | Shu bilan boshlanadi |
| `ends_with` | Shu bilan tugaydi |
| `regex` | Regular expression |

### Context Value

Filtr uchun qiymat:

| Filtr | Value misoli |
|-------|--------------|
| `equals` | `Salom` |
| `contains` | `yordam` |
| `regex` | `^[0-9]+$` |

### Global

| Qiymat | Ishlash |
|--------|---------|
| ❌ O'chirilgan | Faqat joriy State'da |
| ✅ Yoqilgan | Har qanday State'da |

## Misollar

### Har qanday matn

```
┌─────────────────┐
│ Message Trigger │
│   type: text    │
│   filter: any   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Siz yozdingiz:  │
│ {{message.text}}│
└─────────────────┘
```

### Aniq so'z

```
┌─────────────────┐
│ Message Trigger │
│   type: text    │
│ filter: equals  │
│ value: "Salom"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Assalomu alaykum│
└─────────────────┘
```

### Rasm qabul qilish

```
┌─────────────────┐
│ Message Trigger │
│   type: photo   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Rasm qabul      │
│ qilindi! 📸     │
└─────────────────┘
```

### Else handle ishlatish

```
┌─────────────────┐
│ Message Trigger │
│   type: text    │
│ filter: equals  │────────────┐
│ value: "Salom"  │            │
└────────┬────────┘            │
         │                     │ Else
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│ Assalomu alaykum│   │ Tushunmadim 🤔  │
└─────────────────┘   └─────────────────┘
```

## O'zgaruvchilar

Message Trigger ishlaganda:

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.text}}` | Xabar matni |
| `{{message.id}}` | Xabar ID |
| `{{message.type}}` | Xabar turi |
| `{{message.file_id}}` | Fayl ID (media uchun) |
| `{{user.id}}` | Foydalanuvchi ID |
| `{{user.first_name}}` | Foydalanuvchi ismi |

### Media uchun

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.photo.file_id}}` | Rasm ID |
| `{{message.video.file_id}}` | Video ID |
| `{{message.audio.file_id}}` | Audio ID |
| `{{message.document.file_id}}` | Fayl ID |
| `{{message.document.file_name}}` | Fayl nomi |

### Joylashuv uchun

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.location.latitude}}` | Kenglik |
| `{{message.location.longitude}}` | Uzunlik |

### Kontakt uchun

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.contact.phone_number}}` | Telefon raqami |
| `{{message.contact.first_name}}` | Ism |

## Regex misollari

### Telefon raqami

```
^\+?[0-9]{10,15}$
```

### Email

```
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
```

### Faqat raqamlar

```
^[0-9]+$
```

### Faqat harflar

```
^[a-zA-Z\s]+$
```

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- Aniq xabar turini tanlang (`text`, `photo`, etc.)
- Else handle'dan foydalaning — foydalanuvchiga noto'g'ri kiritganini ayting
- Regex'da `^` va `$` ishlatib butun matnni tekshiring

### ❌ Noto'g'ri

- `any` turini kerak bo'lmaganda ishlatmang
- Else'ni bo'sh qoldirmang — foydalanuvchi javob kutadi

## Keyingi

{% content-ref url="callback-query.md" %}
[callback-query.md](callback-query.md)
{% endcontent-ref %}
