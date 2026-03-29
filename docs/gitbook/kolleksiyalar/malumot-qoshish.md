# Ma'lumot qo'shish

Kolleksiyaga elementlar qo'shish, tahrirlash va o'chirish.

## Qo'lda qo'shish

1. Kolleksiyalar sahifasidan kolleksiyani oching
2. **"+ Yangi element"** tugmasini bosing
3. Maydonlarni to'ldiring
4. **"Saqlash"** tugmasini bosing

## Import (CSV/JSON)

### CSV import

1. **"Import"** tugmasini bosing
2. CSV faylni tanlang
3. Ustunlarni maydonlarga moslashtiring
4. **"Import qilish"** tugmasini bosing

**CSV formatи:**
```csv
name,price,in_stock
iPhone 15,999,true
MacBook Pro,1999,true
iPad,799,false
```

### JSON import

```json
[
  {"name": "iPhone 15", "price": 999, "in_stock": true},
  {"name": "MacBook Pro", "price": 1999, "in_stock": true},
  {"name": "iPad", "price": 799, "in_stock": false}
]
```

## Bot orqali qo'shish

### Collection Node

```
┌─────────────────┐
│   Collection    │
│ action: create  │
│ collection:     │
│   products      │
│ data:           │
│   name: {{...}} │
│   price: {{...}}│
└─────────────────┘
```

### Custom Code

```python
add_to_collection("products", {
    "name": get_var("var.product_name"),
    "price": int(get_var("var.price")),
    "in_stock": True
})
```

## Tahrirlash

### Qo'lda

1. Elementni tanlang
2. **"Tahrirlash"** tugmasini bosing
3. O'zgartirishlarni kiriting
4. **"Saqlash"** tugmasini bosing

### Bot orqali

**Collection Node:**
```
action: update
collection: products
item_id: {{var.product_id}}
data:
  price: {{var.new_price}}
```

**Custom Code:**
```python
update_collection_item("products", item_id, {
    "price": new_price,
    "in_stock": False
})
```

## O'chirish

### Qo'lda

1. Elementni tanlang
2. **"O'chirish"** tugmasini bosing
3. Tasdiqlang

### Bot orqali

**Collection Node:**
```
action: delete
collection: products
item_id: {{var.product_id}}
```

**Custom Code:**
```python
delete_from_collection("products", item_id)
```

## Qidirish

### Interfeys orqali

1. Qidirish maydoniga yozing
2. Enter bosing

### Custom Code

```python
# Barcha elementlar
products = get_collection("products")

# Filtrlash
cheap = [p for p in products if p["price"] < 100]
available = [p for p in products if p["in_stock"]]

# Bitta topish
product = find_in_collection("products", {"name": "iPhone 15"})
```

## Keyingi

{% content-ref url="nodeda-ishlatish.md" %}
[nodeda-ishlatish.md](nodeda-ishlatish.md)
{% endcontent-ref %}
