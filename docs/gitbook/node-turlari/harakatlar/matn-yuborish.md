# Matn yuborish

Foydalanuvchiga matn xabari yuboradi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Harakat |
| **Node nomi** | Text Message |
| **Fayl** | `TextMessageNode/TextMessageNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   📝 Matn       │
│  Text Message   │
└────────┬────────┘
         ○ Source
```

## Xususiyatlar

### Text (Matn)

Yuboriladigan xabar matni. O'zgaruvchilar ishlatish mumkin:

```
Salom, {{user.first_name}}!

Sizning ID: {{user.id}}
```

**Maksimal uzunlik:** 4096 belgi

### Parse Mode

Matnni formatlash rejimi:

| Rejim | Misol | Natija |
|-------|-------|--------|
| Yo'q | `*matn*` | *matn* (oddiy) |
| HTML | `<b>matn</b>` | **matn** |
| Markdown | `*matn*` | **matn** |
| MarkdownV2 | `*matn*` | **matn** |

#### HTML teglari

```html
<b>qalin</b>
<i>kursiv</i>
<u>tagiga chizilgan</u>
<s>ustiga chizilgan</s>
<code>kod</code>
<pre>kod bloki</pre>
<a href="https://example.com">havola</a>
```

#### Markdown

```
*qalin*
_kursiv_
`kod`
```preformatted```
[havola](https://example.com)
```

### Keyboard (Tugmalar)

Xabarga tugmalar qo'shish:

#### Inline Keyboard

```
┌─────────────────────────┐
│     Xabar matni         │
├─────────────┬───────────┤
│  Tugma 1    │  Tugma 2  │
└─────────────┴───────────┘
```

#### Reply Keyboard

```
┌───────────────────────────────┐
│         Tugma 1               │
├───────────────────────────────┤
│         Tugma 2               │
└───────────────────────────────┘
```

### Chat ID

| Qiymat | Yuboriladi |
|--------|------------|
| Bo'sh | Joriy foydalanuvchiga |
| `{{user.id}}` | Joriy foydalanuvchiga |
| Raqam | Belgilangan chat'ga |
| `{{var.chat_id}}` | O'zgaruvchidan |

### Reply To Message ID

Qaysi xabarga javob sifatida:

| Qiymat | Natija |
|--------|--------|
| Bo'sh | Oddiy xabar |
| `{{message.id}}` | Kelgan xabarga javob |
| Raqam | Aniq xabarga javob |

### Disable Notification

| Qiymat | Natija |
|--------|--------|
| ❌ O'chirilgan | Ovozli xabar |
| ✅ Yoqilgan | Ovozsiz (silent) |

### Disable Web Preview

Havola preview'ini o'chirish:

| Qiymat | Natija |
|--------|--------|
| ❌ O'chirilgan | Preview ko'rinadi |
| ✅ Yoqilgan | Preview yo'q |

### Protect Content

Xabarni nusxalash va forward qilishni taqiqlash:

| Qiymat | Natija |
|--------|--------|
| ❌ O'chirilgan | Oddiy xabar |
| ✅ Yoqilgan | Himoyalangan |

## Misollar

### Oddiy salom

**Matn:**
```
Assalomu alaykum!
Bot Constructor'ga xush kelibsiz 🎉
```

### Shaxsiylashtirilgan xabar

**Matn:**
```
Salom, {{user.first_name}}!

Sizning ID: {{user.id}}
Username: @{{user.username}}
```

### HTML formatlangan

**Parse mode:** HTML

**Matn:**
```html
<b>Bot Constructor Panel</b>

Vizual bot yaratuvchi dastur.

<i>Imkoniyatlar:</i>
• Drag-and-drop interfeys
• 50+ node turlari
• Python kod yozish

<a href="https://docs.botmother.com">Dokumentatsiya</a>
```

### Tugmalar bilan

**Matn:**
```
Nimani xohlaysiz?
```

**Inline Keyboard:**
| Matn | Callback Data |
|------|---------------|
| 📱 Mahsulotlar | `products` |
| 🛒 Savat | `cart` |
| ℹ️ Yordam | `help` |

## O'zgaruvchilar

Text Message'da ishlatishingiz mumkin:

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{user.id}}` | Foydalanuvchi ID |
| `{{user.first_name}}` | Ism |
| `{{user.last_name}}` | Familiya |
| `{{user.username}}` | Username |
| `{{message.text}}` | Kelgan xabar matni |
| `{{message.id}}` | Xabar ID |
| `{{var.nom}}` | Custom o'zgaruvchi |

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- Emoji ishlatib xabarni jonli qiling 🎉
- Uzun xabarlarni paragraflarga bo'ling
- HTML yoki Markdown ishlatib formatlay

### ❌ Noto'g'ri

- 4096 belgidan oshirmang
- Juda ko'p emoji ishlatmang
- HTML teglardagi xatolar xabalni buzadi

## Keyingi

{% content-ref url="rasm-yuborish.md" %}
[rasm-yuborish.md](rasm-yuborish.md)
{% endcontent-ref %}
