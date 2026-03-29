# Menu bilan bot

**Daraja:** 🟡 O'rta
**Vaqt:** 20 daqiqa

## Natija

Inline tugmalar bilan navigatsiya qilinadigan menu bot.

## Kerakli node'lar

- Command Trigger
- Text Message (tugmalar bilan)
- Callback Query Trigger (bir nechta)
- Callback Answer
- Edit Message

## Qadam 1: Asosiy menu

### /start

**Command Trigger:**
- Command: `start`
- Global: ✅

**Text Message:**
```
🏠 Asosiy menu

Quyidagilardan birini tanlang:
```

**Inline Keyboard:**
| Matn | Callback |
|------|----------|
| 📱 Mahsulotlar | `products` |
| ℹ️ Biz haqimizda | `about` |
| 📞 Aloqa | `contact` |

## Qadam 2: Mahsulotlar

### Callback Query Trigger

- Filter: `equals`
- Value: `products`

### Callback Answer

- Text: (bo'sh qoldiring)

### Edit Message

```
📱 Mahsulotlar

Kategoriyani tanlang:
```

**Keyboard:**
| Matn | Callback |
|------|----------|
| 📲 Telefonlar | `cat_phones` |
| 💻 Kompyuterlar | `cat_computers` |
| ◀️ Orqaga | `main_menu` |

## Qadam 3: Telefonlar

### Callback Query Trigger

- Filter: `equals`
- Value: `cat_phones`

### Edit Message

```
📲 Telefonlar

• iPhone 15 Pro — $1199
• Samsung S24 — $999
• Pixel 8 — $699
```

**Keyboard:**
| Matn | Callback |
|------|----------|
| ◀️ Orqaga | `products` |

## Qadam 4: Biz haqimizda

### Callback: about

```
ℹ️ Biz haqimizda

Biz 2020 yildan beri sifatli mahsulotlar sotamiz.

✅ Sifat kafolati
✅ Tez yetkazib berish
✅ 24/7 qo'llab-quvvatlash
```

**Keyboard:**
| Matn | Callback |
|------|----------|
| ◀️ Orqaga | `main_menu` |

## Qadam 5: Aloqa

### Callback: contact

```
📞 Aloqa

📱 Telefon: +998 90 123 45 67
📧 Email: info@example.com
🌐 Sayt: www.example.com

📍 Manzil: Toshkent sh., Amir Temur ko'chasi
```

**Keyboard:**
| Matn | Callback |
|------|----------|
| ◀️ Orqaga | `main_menu` |

## Qadam 6: Orqaga qaytish

### Callback: main_menu

**Edit Message** — 1-qadamdagi xabar va tugmalarni takrorlang.

## Oqim sxemasi

```
         /start
            │
            ▼
    ┌───────────────┐
    │  Asosiy menu  │
    │ [Mahsulotlar] │
    │ [Biz haqimizda]│
    │ [Aloqa]       │
    └───────┬───────┘
            │
    ┌───────┼───────┐
    ▼       ▼       ▼
┌───────┐ ┌─────┐ ┌─────┐
│Products│ │About│ │Contact│
│[Phones]│ │     │ │     │
│[Comps] │ │     │ │     │
│[Orqaga]│ │     │ │     │
└───┬───┘ └──┬──┘ └──┬──┘
    │        │       │
    └────────┴───────┘
            │
            ▼
       main_menu
```

## Muhim eslatmalar

1. Har bir Callback Query'ga **Callback Answer** qo'shing
2. **Edit Message** ishlatib xabarni yangilang (yangi xabar yuborish emas)
3. **Orqaga** tugmasi har bir submenu'da bo'lsin

## Kengaytirish

### Kolleksiyadan mahsulotlar

Statik mahsulotlar o'rniga kolleksiyadan dinamik tugmalar.

### Savat funksiyasi

Foydalanuvchi mahsulot tanlaganda savatga qo'shish.

## Keyingi

{% content-ref url="forma-bot.md" %}
[forma-bot.md](forma-bot.md)
{% endcontent-ref %}
