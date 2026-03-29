# Node turlari

Bot Constructor Panel'da **node** — bu biror vazifani bajaradigan blok. Node'lar bir-biriga ulanib, bot oqimini (flow) tashkil qiladi.

## Node kategoriyalari

### 🎯 [Triggerlar](triggerlar/)

Botni ishga tushiruvchi hodisalar. Har bir oqim trigger bilan boshlanadi.

| Node | Tavsif |
|------|--------|
| [Command Trigger](triggerlar/command-trigger.md) | `/start`, `/help` buyruqlari |
| [Message Trigger](triggerlar/message-trigger.md) | Xabar kelganda |
| [Callback Query](triggerlar/callback-query.md) | Inline tugma bosilganda |
| [Reply Button](triggerlar/reply-button.md) | Reply tugma bosilganda |
| [Cron Trigger](triggerlar/cron-trigger.md) | Jadval bo'yicha |

### ⚡ [Harakatlar](harakatlar/)

Bot bajaradigan amallar.

| Node | Tavsif |
|------|--------|
| [Text Message](harakatlar/matn-yuborish.md) | Matn yuborish |
| [Photo Message](harakatlar/rasm-yuborish.md) | Rasm yuborish |
| [Video Message](harakatlar/video-yuborish.md) | Video yuborish |
| [Audio Message](harakatlar/audio-yuborish.md) | Audio yuborish |
| [File Message](harakatlar/fayl-yuborish.md) | Fayl yuborish |
| [Location](harakatlar/joylashuv-yuborish.md) | Joylashuv |
| [Contact](harakatlar/kontakt-yuborish.md) | Kontakt |
| [Edit Message](harakatlar/xabar-tahrirlash.md) | Tahrirlash |
| [Delete Message](harakatlar/xabar-ochirish.md) | O'chirish |
| [Boshqalar...](harakatlar/boshqa-harakatlar.md) | Forward, Pin, Dice... |

### 🧠 [Mantiq](mantiq/)

Mantiqiy operatsiyalar va integratsiyalar.

| Node | Tavsif |
|------|--------|
| [If](mantiq/if-node.md) | Shartli mantiq |
| [Variable](mantiq/variable-node.md) | O'zgaruvchi |
| [State](mantiq/state-node.md) | Foydalanuvchi holati |
| [For Loop](mantiq/for-loop.md) | Tsikl |
| [Delay](mantiq/delay-node.md) | Kutish |
| [Random](mantiq/random-node.md) | Tasodifiy tanlash |
| [HTTP Request](mantiq/http-request.md) | API so'rov |
| [Form](mantiq/form-node.md) | Forma to'plash |
| [Custom Code](mantiq/custom-code.md) | Python kod |

## Node tuzilishi

Har bir node quyidagi qismlardan iborat:

```
       ○ ← Target handle (kirish)
┌─────────────────┐
│   📝 Node nomi  │
│                 │
│  Qisqa tavsif   │
│                 │
└─────────────────┘
       ○ ← Source handle (chiqish)
```

### Handle'lar

| Handle | Joylashuvi | Vazifasi |
|--------|------------|----------|
| **Target** | Tepa | Kiruvchi ulanish |
| **Source** | Past | Chiquvchi ulanish |

### Maxsus handle'lar

Ba'zi node'larda bir nechta source handle bor:

**If node:**
```
       ○ ← Target
┌─────────────────┐
│    If (Shart)   │
└────┬───────┬────┘
     ○       ○
   True    False
```

**Message Trigger:**
```
       ○ ← Target
┌─────────────────┐
│ Message Trigger │ ○ ← Else (mos kelmasa)
└────────┬────────┘
         ○ ← Match (mos kelsa)
```

## Node'lar bilan ishlash

### Qo'shish

1. Chap paneldan node'ni sudrab canvas'ga tashlang
2. Yoki `Ctrl+K` bosib qidirib toping

### Sozlash

1. Node ustiga bosing (tanlang)
2. O'ng panelda xususiyatlarni o'zgartiring

### Ulash

1. Source handle'dan bosib torting
2. Target handle'ga qo'yib yuboring

### O'chirish

1. Node'ni tanlang
2. `Delete` yoki `Backspace` bosing

### Nusxalash

1. Node'ni tanlang
2. `Ctrl+C` → `Ctrl+V`
3. Yoki `Ctrl+D` bilan tez nusxalang

## Node ranglari

Node rangi uning turini bildiradi:

| Rang | Tur |
|------|-----|
| 🟢 Yashil | Trigger |
| 🔵 Ko'k | Harakat |
| 🟣 Binafsha | Mantiq |
| 🟠 To'q sariq | Maxsus |

## Keyingi

{% content-ref url="triggerlar/" %}
[triggerlar](triggerlar/)
{% endcontent-ref %}
