# Dinamik tugmalar

Kolleksiya yoki massivdan avtomatik tugmalar yaratish.

## Nima uchun?

Statik tugmalar qo'lda yoziladi:
```
[iPhone] [MacBook] [iPad]
```

Dinamik tugmalar ma'lumotlardan yaratiladi:
```python
products = get_collection("products")
# → Avtomatik tugmalar yaratiladi
```

## Inline tugmalar

### Kolleksiyadan

Text Message node'da:

1. **Keyboard** → **Inline Keyboard**
2. **Source**: Collection
3. **Collection**: products
4. **Button text**: `{{item.name}}`
5. **Callback data**: `product_{{item.id}}`

**Natija:**
```
┌─────────────┬─────────────┐
│   iPhone    │   MacBook   │
├─────────────┼─────────────┤
│    iPad     │   AirPods   │
└─────────────┴─────────────┘
```

### Joylashuv sozlamalari

| Sozlama | Tavsif |
|---------|--------|
| **Columns** | Qatordagi tugmalar soni |
| **Limit** | Maksimal tugmalar |
| **Filter** | Filtrlash sharti |

**Misol:**
- Columns: 2 → Har qatorda 2 ta
- Limit: 10 → Maksimal 10 ta tugma
- Filter: `in_stock == true` → Faqat mavjud mahsulotlar

## Callback bilan ishlash

### Callback data formati

```
product_{{item.id}} → product_123
category_{{item.name}} → category_Telefonlar
```

### Callback Trigger

```
┌─────────────────┐
│ Callback Query  │
│ filter: regex   │
│ ^product_       │
│ ([0-9]+)$       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Custom Code    │
│ # ID ajratish   │
│ data = callback.│
│  data           │
│ id = data.      │
│  split("_")[1]  │
└─────────────────┘
```

### Product ID olish

```python
callback_data = get_var("callback.data")  # "product_123"
product_id = callback_data.split("_")[1]  # "123"

# Mahsulotni yuklash
products = get_collection("products")
product = next((p for p in products if p["id"] == product_id), None)

if product:
    set_var("selected_product", product)
```

## Reply tugmalar

### Kolleksiyadan

1. **Keyboard** → **Reply Keyboard**
2. **Source**: Collection
3. **Collection**: categories
4. **Button text**: `{{item.name}}`

### Maxsus tugmalar bilan

```
┌───────────────────────────────┐
│         [Kategoriyalar]       │ ← Dinamik
├───────────────────────────────┤
│           🏠 Bosh sahifa      │ ← Statik
└───────────────────────────────┘
```

## Custom Code bilan

### Tugmalar yaratish

```python
products = get_collection("products")

# Inline keyboard yaratish
keyboard = []
row = []
for i, product in enumerate(products):
    button = {
        "text": product["name"],
        "callback_data": f"product_{product['id']}"
    }
    row.append(button)
    
    # Har 2 ta tugmadan keyin yangi qator
    if (i + 1) % 2 == 0:
        keyboard.append(row)
        row = []

if row:  # Qolgan tugmalar
    keyboard.append(row)

set_var("product_keyboard", keyboard)
```

### Xabarda ishlatish

Text Message node'da Keyboard source: Variable
Variable: `{{var.product_keyboard}}`

## Sahifalash

Ko'p elementlar uchun sahifalash:

```python
page = int(get_var("var.page") or 0)
per_page = 5

products = get_collection("products")
total = len(products)
total_pages = (total + per_page - 1) // per_page

# Joriy sahifa elementlari
start = page * per_page
end = start + per_page
page_products = products[start:end]

# Navigatsiya tugmalari
nav_row = []
if page > 0:
    nav_row.append({"text": "◀️", "callback_data": f"page_{page-1}"})
nav_row.append({"text": f"{page+1}/{total_pages}", "callback_data": "noop"})
if page < total_pages - 1:
    nav_row.append({"text": "▶️", "callback_data": f"page_{page+1}"})

# Keyboard yaratish
keyboard = []
for p in page_products:
    keyboard.append([{"text": p["name"], "callback_data": f"product_{p['id']}"}])
keyboard.append(nav_row)

set_var("paged_keyboard", keyboard)
```

## Filtrlash

### Kategoriya bo'yicha

```python
category = get_var("var.selected_category")
products = get_collection("products")

# Filtrlash
filtered = [p for p in products if p["category"] == category]

# Tugmalar yaratish
keyboard = [[{"text": p["name"], "callback_data": f"p_{p['id']}"} for p in filtered[i:i+2]] for i in range(0, len(filtered), 2)]

set_var("filtered_keyboard", keyboard)
```

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- Sahifalash ishlatish (5-10 ta/sahifa)
- Callback data'ni qisqa qilish
- Filtrlash imkoniyati

### ❌ Noto'g'ri

- 100+ tugma bir xabarda
- Juda uzun callback data
- Filtrsiz katta kolleksiyalar
