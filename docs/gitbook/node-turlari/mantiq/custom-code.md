# Custom Code

Python kod yozish imkoniyati.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Mantiq |
| **Node nomi** | Custom Code |
| **Fayl** | `CustomCodeNode/CustomCodeNode.tsx` |
| **Til** | Python 3 |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   🐍 Custom     │
│     Code        │
└────────┬────────┘
         ○ Source
```

## Qachon ishlatiladi?

- Murakkab mantiq
- Matematik hisoblashlar
- Matn qayta ishlash
- Tashqi kutubxonalar
- Ma'lumotlarni qayta ishlash

## Mavjud funksiyalar

### O'zgaruvchilar

```python
# O'zgaruvchi olish
name = get_var("name")
user_id = get_var("user.id")

# O'zgaruvchi o'rnatish
set_var("result", 123)
set_var("message", "Salom")
```

### Foydalanuvchi ma'lumotlari

```python
# Foydalanuvchi
user = get_user()
print(user["id"])
print(user["first_name"])
print(user["username"])
```

### Xabar ma'lumotlari

```python
# Kelgan xabar
message = get_message()
print(message["text"])
print(message["id"])
```

### Bot metodlari

```python
# Xabar yuborish
send_message(chat_id, text)
send_message(chat_id, text, parse_mode="HTML")

# Rasm yuborish
send_photo(chat_id, photo_url, caption="Izoh")

# Xabar tahrirlash
edit_message(chat_id, message_id, new_text)

# Xabar o'chirish
delete_message(chat_id, message_id)
```

### Kolleksiyalar

```python
# Kolleksiya olish
users = get_collection("users")

# Element qo'shish
add_to_collection("users", {"name": "Ali", "age": 25})

# Element yangilash
update_collection_item("users", item_id, {"age": 26})

# Element o'chirish
delete_from_collection("users", item_id)
```

### HTTP so'rovlar

```python
import requests

# GET
response = requests.get("https://api.example.com/data")
data = response.json()

# POST
response = requests.post(
    "https://api.example.com/create",
    json={"name": "Test"},
    headers={"Authorization": "Bearer token"}
)
```

## Misollar

### Oddiy hisoblash

```python
price = int(get_var("price"))
quantity = int(get_var("quantity"))
discount = 0.1  # 10% chegirma

total = price * quantity
total_with_discount = total * (1 - discount)

set_var("total", total_with_discount)
```

### Matn qayta ishlash

```python
text = get_var("message.text")

# Katta harfga
upper_text = text.upper()

# So'zlar soni
word_count = len(text.split())

# Email topish
import re
emails = re.findall(r'[\w\.-]+@[\w\.-]+', text)

set_var("word_count", word_count)
set_var("emails", emails)
```

### Sana hisoblash

```python
from datetime import datetime, timedelta

# Bugun
today = datetime.now()

# 7 kun keyin
next_week = today + timedelta(days=7)

# Formatlab chiqarish
formatted = next_week.strftime("%d.%m.%Y")
set_var("deadline", formatted)
```

### Random ID yaratish

```python
import uuid
import random
import string

# UUID
unique_id = str(uuid.uuid4())

# Qisqa ID
short_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

set_var("order_id", short_id)
```

### JSON bilan ishlash

```python
import json

# JSON string → Python dict
data_str = get_var("json_data")
data = json.loads(data_str)

# Python dict → JSON string
result = json.dumps({"status": "ok", "count": 5})
set_var("result", result)
```

### Kolleksiyadan qidirish

```python
products = get_collection("products")

# Arzon mahsulotlar
cheap_products = [p for p in products if p["price"] < 100]

# Eng arzon
cheapest = min(products, key=lambda x: x["price"])

set_var("cheapest_product", cheapest["name"])
```

## Xatolik boshqarish

```python
try:
    result = risky_operation()
    set_var("result", result)
except Exception as e:
    set_var("error", str(e))
```

## Cheklovlar

| Cheklov | Qiymat |
|---------|--------|
| Bajarilish vaqti | 30 soniya |
| Xotira | 128 MB |
| Fayl tizimi | Faqat o'qish |
| Tarmoq | Ruxsat berilgan |

## Mavjud kutubxonalar

- `requests` — HTTP so'rovlar
- `json` — JSON
- `re` — Regex
- `datetime` — Sana va vaqt
- `math` — Matematik funksiyalar
- `random` — Tasodifiy
- `uuid` — Unique ID
- `hashlib` — Xeshlash

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- try/except ishlatish
- Aniq o'zgaruvchi nomlari
- Kodga izoh yozish
- Kichik funksiyalarga bo'lish

### ❌ Noto'g'ri

- Cheksiz tsikllar
- Katta fayllar bilan ishlash
- Sirlarni kodda saqlash

## Keyingi

{% content-ref url="../../custom-code/" %}
[custom-code bo'limi](../../custom-code/)
{% endcontent-ref %}
