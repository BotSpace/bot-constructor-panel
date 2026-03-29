# Asosiy oyna

Bot Constructor Panel asosiy oynasi bir nechta qismlardan iborat.

## Umumiy ko'rinish

```
┌─────────────────────────────────────────────────────────────────┐
│  Header (Sarlavha paneli)                                       │
├──────────┬───────────────────────────────────┬──────────────────┤
│          │                                   │                  │
│   Node   │        Canvas (Editor)            │   Properties     │
│  Panel   │                                   │     Panel        │
│          │                                   │                  │
│          │                                   │                  │
│          │                                   │                  │
│          │                                   │                  │
├──────────┴───────────────────────────────────┴──────────────────┤
│  Minimap                                                        │
└─────────────────────────────────────────────────────────────────┘
```

## 1. Header (Sarlavha paneli)

Ekranning eng yuqori qismi. Bu yerda:

| Element | Vazifasi |
|---------|----------|
| **Logo** | Bosh sahifaga qaytish |
| **Loyiha nomi** | Joriy loyiha nomi |
| **Saqlash** | Oqimni saqlash (`Ctrl+S`) |
| **Undo/Redo** | Bekor qilish/Qaytarish |
| **Til tanlash** | Interfeys tilini o'zgartirish |
| **Theme** | Qorong'i/Yorug' rejim |
| **Profil** | Foydalanuvchi sozlamalari |

## 2. Node Panel (Chap panel)

Barcha mavjud node turlarining ro'yxati. Uchta kategoriyaga bo'lingan:

### Triggerlar 🎯
Botni ishga tushiruvchi hodisalar:
- Command Trigger
- Message Trigger
- Callback Query Trigger
- Reply Button Trigger
- Cron Trigger

### Harakatlar ⚡
Bot bajaradigan amallar:
- Text Message
- Photo, Video, Audio
- Location, Contact
- Edit Message, Delete Message
- va boshqalar...

### Mantiq 🧠
Mantiqiy operatsiyalar:
- If (Shart)
- Variable (O'zgaruvchi)
- State (Holat)
- For Loop (Sikl)
- HTTP Request
- Custom Code
- va boshqalar...

### Qidirish

Node panelining tepasida **qidirish maydoni** bor. Node nomini yozib tez topishingiz mumkin.

## 3. Canvas (Markaziy maydon)

Bu asosiy ish maydoni. Bu yerda:

- **Node'lar qo'shish** — chap paneldan sudrab olib tashlang
- **Node'larni ulash** — chiqish nuqtasidan kirish nuqtasiga torting
- **Masshtablash** — sichqoncha g'ildiragi yoki `Ctrl +/-`
- **Pan (surish)** — bo'sh joyni bosib surish

### Canvas boshqaruvlari

| Amal | Klaviatura/Sichqoncha |
|------|----------------------|
| Masshtablash | Sichqoncha g'ildiragi |
| Surish (Pan) | Bo'sh joyni bosib surish |
| Tanlash | Node ustiga bosish |
| Ko'p tanlash | `Shift` + bosish |
| Nusxa olish | `Ctrl+C` |
| Joylash | `Ctrl+V` |
| O'chirish | `Delete` yoki `Backspace` |

## 4. Properties Panel (O'ng panel)

Tanlangan node'ning xususiyatlarini tahrirlash paneli.

### Umumiy xususiyatlar

Har bir node'da quyidagi umumiy xususiyatlar bor:

| Xususiyat | Tavsif |
|-----------|--------|
| **Nom** | Node'ning identifikatori |
| **Izoh** | Shaxsiy eslatma |

### Node-ga xos xususiyatlar

Har bir node turining o'ziga xos sozlamalari bor:

**Masalan, Text Message node:**
- Matn
- Parse mode (HTML/Markdown)
- Tugmalar
- Reply to message

## 5. Minimap

Canvas'ning quyi qismida kichik xarita. Katta oqimlarda navigatsiya uchun foydali.

### Funksiyalar

- Hozirgi ko'rinish — moviy ramka
- Tez navigatsiya — minimap ustiga bosish
- Yashirish mumkin

## 6. Context Menu

Canvas'da yoki node ustida **o'ng tugma** bosilganda paydo bo'ladigan menyu:

### Canvas context menu
- Paste (Joylash)
- Select All (Hammasini tanlash)
- Fit View (Ekranga sig'dirish)

### Node context menu
- Copy (Nusxa olish)
- Duplicate (Nusxalash)
- Delete (O'chirish)
- Add Note (Izoh qo'shish)

## Keyingi

{% content-ref url="node-paneli.md" %}
[node-paneli.md](node-paneli.md)
{% endcontent-ref %}
