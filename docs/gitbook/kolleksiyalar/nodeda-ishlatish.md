# Node'da ishlatish

Kolleksiyalarni bot oqimida ishlatish.

## Kolleksiya yuklash

### Load Collection Item

Bitta elementni ID bo'yicha yuklash:

```
┌─────────────────┐
│ Load Collection │
│     Item        │
│ collection:     │
│   products      │
│ item_id:        │
│ {{var.id}}      │
└────────┬────────┘
         │
         ▼
Result: {{var.loaded_item}}
```

Keyin ishlatish:
```
{{var.loaded_item.name}}
{{var.loaded_item.price}}
```

## For Loop bilan

Barcha elementlarni ko'rsatish:

```
┌─────────────────┐
│    For Loop     │
│ items:          │
│ {{collection.   │
│   products}}    │
└────┬───────┬────┘
     │       │
   Body    Done
     │
     ▼
┌─────────────────┐
│  Text Message   │
│ {{loop.index}}. │
│ {{loop.item.    │
│   name}}        │
│ ${{loop.item.   │
│   price}}       │
└─────────────────┘
```

## Dinamik tugmalar

Kolleksiyadan inline tugmalar yaratish:

```
┌─────────────────┐
│  Text Message   │
│ "Tanlang:"      │
│                 │
│ [Keyboard from  │
│  collection]    │
└─────────────────┘
```

**Keyboard sozlamalari:**
- Source: Collection
- Collection: products
- Button text: `{{item.name}}`
- Callback data: `product_{{item.id}}`

## Collection Node

### Create (Yaratish)

```
┌─────────────────┐
│   Collection    │
│ action: create  │
│ collection:     │
│   users         │
│ data:           │
│  telegram_id:   │
│   {{user.id}}   │
│  name: {{user.  │
│   first_name}}  │
└─────────────────┘
```

### Update (Yangilash)

```
┌─────────────────┐
│   Collection    │
│ action: update  │
│ collection:     │
│   users         │
│ find_by:        │
│  telegram_id:   │
│   {{user.id}}   │
│ data:           │
│  phone: {{var.  │
│   phone}}       │
└─────────────────┘
```

### Delete (O'chirish)

```
┌─────────────────┐
│   Collection    │
│ action: delete  │
│ collection:     │
│   cart_items    │
│ item_id:        │
│ {{var.item_id}} │
└─────────────────┘
```

## Misollar

### Mahsulotlar ro'yxati

```
Command: /products
        │
        ▼
┌─────────────────┐
│    For Loop     │
│ products        │
└────┬───────┬────┘
     │       │
   Body    Done
     │       │
     ▼       ▼
┌───────────┐ ┌───────────┐
│Photo+Text │ │"Barchasi  │
│{{item...}}│ │  shu"     │
└───────────┘ └───────────┘
```

### Foydalanuvchi ro'yxatdan o'tishi

```
/start
   │
   ▼
┌─────────────────┐
│   If: user      │
│   exists?       │
└────┬───────┬────┘
     │       │
   Yes      No
     │       │
     ▼       ▼
┌───────────┐ ┌───────────────┐
│"Qaytdingiz│ │  Collection   │
│   !"      │ │ create: users │
└───────────┘ └───────────────┘
```

### Savat

```
Add to cart
      │
      ▼
┌─────────────────┐
│   Collection    │
│ create: cart    │
│ user_id: {{..}} │
│ product_id:     │
│  {{callback.    │
│    data}}       │
└─────────────────┘
```

## Custom Code bilan

```python
# Foydalanuvchini topish yoki yaratish
users = get_collection("users")
user_id = get_var("user.id")

existing = [u for u in users if u["telegram_id"] == user_id]

if existing:
    # Mavjud
    set_var("user_data", existing[0])
else:
    # Yangi yaratish
    new_user = {
        "telegram_id": user_id,
        "first_name": get_var("user.first_name"),
        "registered_at": datetime.now().isoformat()
    }
    add_to_collection("users", new_user)
    set_var("user_data", new_user)
```
