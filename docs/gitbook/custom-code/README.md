# Custom Code

Ushbu bo'limda **Python** tili yordamida bot funksionalligini kengaytirish haqida o'rganasiz.

## Nima uchun Custom Code?

Bot Constructor'ning vizual node'lari ko'p vazifalarni bajaradi. Lekin ba'zan:

- Murakkab matematik hisoblashlar kerak
- Ma'lumotlarni qayta ishlash kerak
- Maxsus algoritmlar kerak
- Tashqi API'lar bilan ishlash kerak

Bunday holatlarda **Custom Code** node ishlatiladi.

## Bo'lim tarkibi

| Sahifa | Tavsif |
|--------|--------|
| [Python asoslari](python-asoslari.md) | Python tilining asosiy tushunchalari |
| [Bot API metodlari](bot-api.md) | Mavjud funksiyalar ro'yxati |
| [O'zgaruvchilar](ozgaruvchilar.md) | O'zgaruvchilar bilan ishlash |
| [Telegram API](telegram-api.md) | Telegram Bot API metodlari |
| [Kod misollari](misollar.md) | Tayyor kod namunalari |

## Tez boshlash

### 1. Custom Code node qo'shing

1. Chap paneldan **Mantiq** → **Custom Code** ni tanlang
2. Canvas'ga sudrab olib tashlang

### 2. Kod yozing

```python
# Foydalanuvchi ismini olish
name = get_var("user.first_name")

# Salomlash
greeting = f"Salom, {name}!"

# Natijani saqlash
set_var("greeting", greeting)
```

### 3. Natijani ishlating

Text Message node'da:
```
{{var.greeting}}
```

## Kod yozish qoidalari

### ✅ Ruxsat berilgan

- O'zgaruvchilar bilan ishlash
- Matematik hisoblashlar
- Matn qayta ishlash
- HTTP so'rovlar (requests)
- JSON bilan ishlash
- Sana/vaqt operatsiyalari

### ❌ Ruxsat berilmagan

- Fayl tizimiga yozish
- Cheksiz tsikllar
- Import qilinmagan kutubxonalar
- 30 soniyadan uzun bajarilish

## Asosiy funksiyalar

| Funksiya | Tavsif |
|----------|--------|
| `get_var(name)` | O'zgaruvchi olish |
| `set_var(name, value)` | O'zgaruvchi o'rnatish |
| `get_user()` | Foydalanuvchi ma'lumotlari |
| `get_message()` | Xabar ma'lumotlari |
| `send_message(chat_id, text)` | Xabar yuborish |
| `get_collection(name)` | Kolleksiya olish |

## Keyingi

{% content-ref url="python-asoslari.md" %}
[python-asoslari.md](python-asoslari.md)
{% endcontent-ref %}
