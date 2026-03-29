# Birinchi bot

Bu qo'llanmada siz oddiy "Salom" deb javob beradigan bot yaratishni o'rganasiz.

## 1-qadam: Yangi loyiha yaratish

1. Bosh sahifaga kiring
2. **"Yangi loyiha"** tugmasini bosing
3. Loyiha nomini kiriting (masalan: "Mening birinchi botim")
4. Telegram bot tokeningizni kiriting
5. **"Yaratish"** tugmasini bosing

{% hint style="info" %}
Token olish haqida: [Tizim talablari → Telegram bot tokeni](tizim-talablari.md#telegram-bot-tokeni)
{% endhint %}

## 2-qadam: Constructor ochiladi

Loyiha yaratilgach, siz **Constructor** sahifasiga o'tasiz. Bu yerda:

- **Chap panel** — barcha node turlarining ro'yxati
- **Markaziy maydon** — bot oqimini quradigan canvas
- **O'ng panel** — tanlangan node'ning xususiyatlari

## 3-qadam: Command Trigger qo'shish

Birinchi navbatda, botni qachon ishga tushirishni belgilashimiz kerak.

1. Chap panelda **"Triggerlar"** bo'limini oching
2. **"Command Trigger"** ni canvas'ga sudrab olib tashlang
3. Node paydo bo'ladi

### Konfiguratsiya

O'ng panelda quyidagilarni kiriting:
- **Buyruq**: `start`

Bu bot `/start` buyrug'iga javob berishini bildiradi.

## 4-qadam: Text Message qo'shish

Endi javob xabarini qo'shamiz.

1. Chap panelda **"Harakatlar"** bo'limini oching
2. **"Text Message"** ni canvas'ga sudrab olib tashlang
3. Node paydo bo'ladi

### Konfiguratsiya

O'ng panelda quyidagilarni kiriting:
- **Matn**: `Salom! Men sizning botingizman 🤖`

## 5-qadam: Node'larni ulash

Endi ikkala node'ni bir-biriga ulashimiz kerak.

1. **Command Trigger** node'ning pastidagi **nuqta**ga bosing
2. Sichqonchani **Text Message** node'ning tepasidagi **nuqta**ga olib boring
3. Chiziq paydo bo'ladi — bu **edge** (ulanish)

```
┌─────────────────┐
│  /start         │
│  Command Trigger│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Salom! Men...  │
│  Text Message   │
└─────────────────┘
```

## 6-qadam: Saqlash

1. Yuqori o'ng burchakdagi **"Saqlash"** tugmasini bosing
2. Yoki `Ctrl+S` (Mac: `Cmd+S`) bosing

{% hint style="success" %}
Oqim saqlandi! Endi botingiz ishlaydi.
{% endhint %}

## 7-qadam: Sinab ko'rish

1. Telegram'da botingizni oching
2. `/start` buyrug'ini yuboring
3. Bot **"Salom! Men sizning botingizman 🤖"** deb javob beradi

## Natija

🎉 **Tabriklaymiz!** Siz birinchi Telegram botingizni yaratdingiz!

## Keyingi qadamlar

Endi quyidagilarni o'rganishingiz mumkin:

- [Message Trigger](../node-turlari/triggerlar/message-trigger.md) — foydalanuvchi xabariga javob berish
- [Inline tugmalar](../tugmalar/inline-tugmalar.md) — interaktiv tugmalar qo'shish
- [Variable node](../node-turlari/mantiq/variable-node.md) — ma'lumotlarni saqlash

{% content-ref url="../interface/asosiy-oyna.md" %}
[asosiy-oyna.md](../interface/asosiy-oyna.md)
{% endcontent-ref %}
