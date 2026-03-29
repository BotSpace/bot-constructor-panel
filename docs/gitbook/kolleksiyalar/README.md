# Kolleksiyalar

**Kolleksiya** — bu bot ichidagi ma'lumotlar bazasi. Foydalanuvchilar, mahsulotlar, buyurtmalar kabi ma'lumotlarni saqlash va boshqarish uchun ishlatiladi.

## Nima uchun kolleksiya?

| Vaziyat | Yechim |
|---------|--------|
| Mahsulotlar ro'yxati | Products kolleksiyasi |
| Foydalanuvchilar ma'lumoti | Users kolleksiyasi |
| Buyurtmalar tarixi | Orders kolleksiyasi |
| FAQ savol-javoblar | FAQ kolleksiyasi |

## Bo'lim tarkibi

| Sahifa | Tavsif |
|--------|--------|
| [Yaratish](yaratish.md) | Kolleksiya yaratish |
| [Ma'lumot qo'shish](malumot-qoshish.md) | Elementlar bilan ishlash |
| [Node'da ishlatish](nodeda-ishlatish.md) | Node'larda kolleksiya |

## Tez boshlash

### 1. Kolleksiya yaratish

1. **Kolleksiyalar** sahifasiga o'ting
2. **"Yangi kolleksiya"** tugmasini bosing
3. Nom bering: `products`

### 2. Maydonlar qo'shish

| Maydon | Tur |
|--------|-----|
| name | Text |
| price | Number |
| image | Text (URL) |
| in_stock | Boolean |

### 3. Ma'lumot qo'shish

```json
{
  "name": "iPhone 15",
  "price": 999,
  "image": "https://example.com/iphone.jpg",
  "in_stock": true
}
```

### 4. Bot'da ishlatish

**For Loop** node bilan:
```
items: {{collection.products}}
```

**Text Message**:
```
{{loop.item.name}} — ${{loop.item.price}}
```

## Kolleksiya vs Variable

| Kolleksiya | Variable |
|------------|----------|
| Ko'p elementlar | Bitta qiymat |
| Doimiy saqlash | Session davomida |
| CRUD operatsiyalar | O'qish/yozish |
| Ma'lumotlar bazasi | Vaqtinchalik |

## Keyingi

{% content-ref url="yaratish.md" %}
[yaratish.md](yaratish.md)
{% endcontent-ref %}
