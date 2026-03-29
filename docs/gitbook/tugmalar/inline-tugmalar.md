# Inline tugmalar

Xabar ichida joylashgan interaktiv tugmalar.

## Yaratish

1. Text Message (yoki boshqa xabar) node'ini tanlang
2. O'ng panelda **Keyboard** bo'limini oching
3. **"Inline Keyboard"** tanlang
4. Tugmalar qo'shing

## Tugma xususiyatlari

### Matn

Tugmada ko'rinadigan matn:
```
📱 Mahsulotlar
```

### Callback Data

Tugma bosilganda yuboriladigan qiymat:
```
products
```

{% hint style="warning" %}
Callback data 64 baytdan oshmasligi kerak!
{% endhint %}

### URL

Havola ochish uchun:
```
https://example.com
```

### Tugma turlari

| Tur | Vazifa |
|-----|--------|
| Callback | Ma'lumot yuborish |
| URL | Havola ochish |
| Login URL | OAuth login |
| Switch Inline | Inline rejimga o'tish |
| Web App | Mini App ochish |

## Joylashuv

Tugmalar qator va ustunlarda joylashadi:

**1 qator, 2 tugma:**
```
┌─────────┬─────────┐
│ Tugma 1 │ Tugma 2 │
└─────────┴─────────┘
```

**2 qator, 1 tugma:**
```
┌─────────────────┐
│     Tugma 1     │
├─────────────────┤
│     Tugma 2     │
└─────────────────┘
```

**Kombinatsiya:**
```
┌─────────┬─────────┐
│ Tugma 1 │ Tugma 2 │
├─────────┴─────────┤
│      Tugma 3      │
└───────────────────┘
```

## Callback bilan ishlash

### 1. Xabar yuborish

```
┌─────────────────┐
│  Text Message   │
│ "Tanlang:"      │
│ [Mahsulotlar]   │
│ [Yordam]        │
└─────────────────┘
```

**Tugmalar:**
- Matn: "Mahsulotlar", Callback: `products`
- Matn: "Yordam", Callback: `help`

### 2. Callback trigger

```
┌─────────────────┐
│ Callback Query  │
│ data: products  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Callback Answer │
│ text: "OK"      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Edit Message   │
│ "Mahsulotlar:"  │
│ [iPhone] [Mac]  │
└─────────────────┘
```

## Xabarni tahrirlash

Inline tugma bosilganda xabarni yangilash:

```python
# Callback Query Trigger'dan keyin

# 1. Callback Answer (loading to'xtatish)
# 2. Edit Message (yangi matn va tugmalar)
```

**Tugmalarni yangilash:**
```
┌─────────────────┐
│  Edit Message   │
│ same text       │
│ [✅ Tanlangan]  │ ← Yangi tugmalar
└─────────────────┘
```

## Misollar

### Menu

```
Asosiy menu:
├─────────────┬─────────────┤
│📱Mahsulotlar│  🛒 Savat   │
├─────────────┼─────────────┤
│  👤 Profil  │  ℹ️ Yordam  │
└─────────────┴─────────────┘
```

### Sahifalash

```
Sahifa 1/5
├─────────────────────────────┤
│  ◀️  │   1   │   2   │  ▶️  │
└─────────────────────────────┘
```

### Tasdiqlash

```
Buyurtmani tasdiqlaysizmi?
├───────────────┬─────────────┤
│   ✅ Ha       │   ❌ Yo'q   │
└───────────────┴─────────────┘
```

### Orqaga tugma

```
Kategoriya: Telefonlar
├─────────────────────────────┤
│          ◀️ Orqaga          │
└─────────────────────────────┘
```

## O'zgaruvchilar

Tugma matnida o'zgaruvchilar:

```
Matn: {{var.product_name}} - ${{var.price}}
Callback: buy_{{var.product_id}}
```

## Cheklovlar

| Cheklov | Qiymat |
|---------|--------|
| Callback data uzunligi | 64 bayt |
| Qatordagi tugmalar | 8 tagacha |
| Qatorlar soni | Cheklanmagan |
| Tugma matn uzunligi | Cheklanmagan (lekin qisqa yaxshi) |

## Keyingi

{% content-ref url="reply-tugmalar.md" %}
[reply-tugmalar.md](reply-tugmalar.md)
{% endcontent-ref %}
