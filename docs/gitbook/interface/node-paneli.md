# Node paneli

Chap paneldagi node ro'yxati — bu barcha mavjud bloklarning katalogi.

## Panelni ochish/yopish

- Chap tomondagi **chevron** (strelka) belgisini bosing
- Yoki `[` tugmasini bosing

## Kategoriyalar

Node'lar 3 ta asosiy kategoriyaga bo'lingan:

### 🎯 Triggerlar

Botni ishga tushiruvchi hodisalar. Har bir oqim trigger bilan boshlanadi.

| Node | Tavsif |
|------|--------|
| Command Trigger | `/start`, `/help` kabi buyruqlar |
| Message Trigger | Matn, rasm, video xabarlar |
| Callback Query | Inline tugma bosilganda |
| Reply Button | Reply tugma bosilganda |
| Cron Trigger | Jadval bo'yicha (vaqtli) |

### ⚡ Harakatlar

Bot bajaradigan amallar.

| Node | Tavsif |
|------|--------|
| Text Message | Matn yuborish |
| Photo Message | Rasm yuborish |
| Video Message | Video yuborish |
| Audio Message | Audio yuborish |
| File Message | Fayl yuborish |
| Location | Joylashuv yuborish |
| Contact | Kontakt yuborish |
| Edit Message | Xabarni tahrirlash |
| Delete Message | Xabarni o'chirish |
| Forward Message | Xabarni yo'naltirish |
| Copy Message | Xabarni nusxalash |
| Pin/Unpin | Xabarni mahkamlash |
| Send to Admin | Adminga xabar |
| Sticker | Stiker yuborish |
| Animation | GIF/animatsiya |
| Voice/Video Note | Ovozli/video xabar |
| Poll | So'rovnoma |
| Dice | Emoji o'yini |
| Media Group | Bir nechta media |
| Chat Action | "Yozmoqda..." ko'rsatish |

### 🧠 Mantiq

Mantiqiy operatsiyalar va integratsiyalar.

| Node | Tavsif |
|------|--------|
| If | Shartli mantiq |
| Else If | Qo'shimcha shart |
| Else | Boshqa holat |
| Variable | O'zgaruvchi yaratish |
| State | Foydalanuvchi holati |
| For Loop | Tsikl (takrorlash) |
| For Loop Continue | Tsikldan chiqish |
| Delay | Kutish (pauza) |
| Random | Tasodifiy tanlash |
| HTTP Request | API so'rov |
| Form | Forma to'plash |
| Collection | Kolleksiya bilan ishlash |
| Load Collection Item | Elementni yuklash |
| Check Membership | Kanal obunasini tekshirish |
| Callback Answer | Callback javob |
| SubFlow | Boshqa oqimga o'tish |
| SubFlow Exit | Oqimdan chiqish |
| Custom Code | Python kod |

## Qidirish

Panel tepasidagi **qidirish maydoni**ga node nomini yozing:

1. Inglizcha nom: `text`, `message`, `if`
2. Yoki node funksiyasi: `yuborish`, `shart`

{% hint style="tip" %}
`Ctrl+K` bosib qidiruvni tez ochishingiz mumkin.
{% endhint %}

## Node qo'shish usullari

### 1. Drag & Drop (Sudrab tashlash)

1. Kerakli node ustiga bosing va ushlab turing
2. Canvas'ga sudrab olib boring
3. Kerakli joyda qo'yib yuboring

### 2. Double-click (Ikki marta bosish)

1. Kerakli node ustiga ikki marta bosing
2. Node canvas markaziga qo'yiladi

### 3. Context menu

1. Canvas'da bo'sh joyda o'ng tugma bosing
2. **"Add Node"** ni tanlang
3. Kerakli node'ni toping

## Filtrlash

Panel tepasidagi **filter** tugmalari:

| Tugma | Ko'rsatadi |
|-------|-----------|
| **Hammasi** | Barcha node'lar |
| **Triggerlar** | Faqat triggerlar |
| **Harakatlar** | Faqat harakatlar |
| **Mantiq** | Faqat mantiq node'lari |

## Keyingi

{% content-ref url="properties-panel.md" %}
[properties-panel.md](properties-panel.md)
{% endcontent-ref %}
