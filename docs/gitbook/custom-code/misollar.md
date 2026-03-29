# Kod misollari

Tayyor Python kod namunalari.

## Matn bilan ishlash

### Emoji sanash

```python
import re

text = get_var("message.text")
emojis = re.findall(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF]', text)
count = len(emojis)

set_var("emoji_count", count)
```

### Telefon raqamini formatlash

```python
phone = get_var("message.text")

# Faqat raqamlar
digits = ''.join(filter(str.isdigit, phone))

# +998 formatida
if len(digits) == 9:
    digits = "998" + digits
    
formatted = f"+{digits[:3]} ({digits[3:5]}) {digits[5:8]}-{digits[8:10]}-{digits[10:]}"
set_var("phone_formatted", formatted)
```

### Email tekshirish

```python
import re

email = get_var("message.text")
pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

if re.match(pattern, email):
    set_var("email_valid", True)
else:
    set_var("email_valid", False)
```

## Hisoblashlar

### Foiz hisoblash

```python
total = float(get_var("var.total"))
discount_percent = float(get_var("var.discount"))

discount_amount = total * discount_percent / 100
final_price = total - discount_amount

set_var("discount_amount", round(discount_amount, 2))
set_var("final_price", round(final_price, 2))
```

### Valyuta konvertatsiya

```python
import requests

amount = float(get_var("var.amount"))
from_currency = "USD"
to_currency = "UZS"

# API orqali kurs olish
url = f"https://api.exchangerate-api.com/v4/latest/{from_currency}"
response = requests.get(url)
rate = response.json()["rates"][to_currency]

converted = amount * rate
set_var("converted_amount", round(converted, 2))
```

### Masofani hisoblash

```python
import math

lat1 = float(get_var("var.lat1"))
lon1 = float(get_var("var.lon1"))
lat2 = float(get_var("var.lat2"))
lon2 = float(get_var("var.lon2"))

# Haversine formula
R = 6371  # Yer radiusi km

lat1_rad = math.radians(lat1)
lat2_rad = math.radians(lat2)
delta_lat = math.radians(lat2 - lat1)
delta_lon = math.radians(lon2 - lon1)

a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
distance = R * c

set_var("distance_km", round(distance, 2))
```

## Sana va vaqt

### Kun sanash

```python
from datetime import datetime, timedelta

# Bugundan 7 kun keyin
today = datetime.now()
next_week = today + timedelta(days=7)

set_var("deadline", next_week.strftime("%d.%m.%Y"))
```

### Ikki sana orasidagi kun

```python
from datetime import datetime

date1_str = get_var("var.start_date")  # "01.01.2024"
date2_str = get_var("var.end_date")    # "15.01.2024"

date1 = datetime.strptime(date1_str, "%d.%m.%Y")
date2 = datetime.strptime(date2_str, "%d.%m.%Y")

delta = abs((date2 - date1).days)
set_var("days_between", delta)
```

### Yoshni hisoblash

```python
from datetime import datetime

birth_date_str = get_var("var.birth_date")  # "15.05.1990"
birth_date = datetime.strptime(birth_date_str, "%d.%m.%Y")
today = datetime.now()

age = today.year - birth_date.year
if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
    age -= 1

set_var("age", age)
```

## Ro'yxatlar

### Tasodifiy element

```python
import random

items = get_var("var.items")  # ["olma", "nok", "uzum"]
random_item = random.choice(items)
set_var("random_item", random_item)
```

### Ro'yxatni aralashtirish

```python
import random

items = get_var("var.items")
random.shuffle(items)
set_var("shuffled_items", items)
```

### Takrorlanuvchilarni olib tashlash

```python
items = get_var("var.items")
unique_items = list(set(items))
set_var("unique_items", unique_items)
```

### Eng ko'p takrorlangan

```python
from collections import Counter

items = get_var("var.items")
counter = Counter(items)
most_common = counter.most_common(1)[0][0]
set_var("most_common", most_common)
```

## HTTP so'rovlar

### API'dan ma'lumot olish

```python
import requests

city = get_var("var.city")
api_key = get_var("var.weather_api_key")

url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
response = requests.get(url)
data = response.json()

temp = data["main"]["temp"]
description = data["weather"][0]["description"]

set_var("temperature", temp)
set_var("weather_description", description)
```

### Webhook yuborish

```python
import requests
import json
from datetime import datetime

webhook_url = get_var("var.webhook_url")
user = get_user()

payload = {
    "event": "new_order",
    "user_id": user["id"],
    "username": user.get("username", ""),
    "order_data": {
        "product_id": get_var("var.product_id"),
        "quantity": get_var("var.quantity")
    },
    "timestamp": datetime.now().isoformat()
}

response = requests.post(
    webhook_url,
    json=payload,
    headers={"Content-Type": "application/json"}
)

set_var("webhook_success", response.status_code == 200)
```

## Kolleksiyalar

### Qidirish va filtrlash

```python
products = get_collection("products")

# Narxi 100 dan kam
cheap = [p for p in products if p["price"] < 100]

# Nomi bilan qidirish
search = get_var("var.search_query").lower()
found = [p for p in products if search in p["name"].lower()]

set_var("found_products", found)
```

### Statistika

```python
orders = get_collection("orders")

# Umumiy summa
total = sum(order["amount"] for order in orders)

# O'rtacha
average = total / len(orders) if orders else 0

# Eng katta
max_order = max(orders, key=lambda x: x["amount"]) if orders else None

set_var("total_sales", total)
set_var("average_order", round(average, 2))
set_var("max_order", max_order)
```

## Xavfsizlik

### Hash yaratish

```python
import hashlib

data = get_var("var.data")
hash_object = hashlib.sha256(data.encode())
hash_hex = hash_object.hexdigest()

set_var("hash", hash_hex)
```

### Tasodifiy token

```python
import secrets
import string

# 32 belgili token
token = secrets.token_hex(16)
set_var("token", token)

# Faqat harflar va raqamlar
alphabet = string.ascii_letters + string.digits
code = ''.join(secrets.choice(alphabet) for _ in range(8))
set_var("code", code)
```

## Debugging

### Barcha o'zgaruvchilarni ko'rish

```python
user = get_user()
message = get_message()

log("=== DEBUG ===")
log(f"User: {user}")
log(f"Message: {message}")
log(f"Custom vars: name={get_var('var.name')}, count={get_var('var.count')}")
log("=== END ===")
```
