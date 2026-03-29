# Telegram API

Telegram Bot API metodlarini Custom Code orqali chaqirish.

## Telegram Bot API haqida

Telegram Bot API — bu Telegram botlari uchun rasmiy API. Bot Constructor'ning barcha xabar node'lari aslida ushbu API metodlarini chaqiradi.

Custom Code'da siz to'g'ridan-to'g'ri API metodlarini chaqirishingiz mumkin.

## Asosiy metodlar

### sendMessage

Matn xabari yuborish.

```python
import requests

BOT_TOKEN = get_var("bot.token")
chat_id = get_var("user.id")

url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
data = {
    "chat_id": chat_id,
    "text": "Salom!",
    "parse_mode": "HTML"
}
response = requests.post(url, json=data)
```

### sendPhoto

Rasm yuborish.

```python
url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto"
data = {
    "chat_id": chat_id,
    "photo": "https://example.com/image.jpg",
    "caption": "Mening rasmim"
}
response = requests.post(url, json=data)
```

### editMessageText

Xabarni tahrirlash.

```python
url = f"https://api.telegram.org/bot{BOT_TOKEN}/editMessageText"
data = {
    "chat_id": chat_id,
    "message_id": message_id,
    "text": "Yangi matn"
}
response = requests.post(url, json=data)
```

### deleteMessage

Xabarni o'chirish.

```python
url = f"https://api.telegram.org/bot{BOT_TOKEN}/deleteMessage"
data = {
    "chat_id": chat_id,
    "message_id": message_id
}
response = requests.post(url, json=data)
```

### answerCallbackQuery

Callback so'rovga javob berish.

```python
url = f"https://api.telegram.org/bot{BOT_TOKEN}/answerCallbackQuery"
data = {
    "callback_query_id": callback_id,
    "text": "Tanlandi!",
    "show_alert": False
}
response = requests.post(url, json=data)
```

## Inline Keyboard

Inline tugmalar bilan xabar yuborish.

```python
url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
data = {
    "chat_id": chat_id,
    "text": "Tanlang:",
    "reply_markup": {
        "inline_keyboard": [
            [
                {"text": "Tugma 1", "callback_data": "btn1"},
                {"text": "Tugma 2", "callback_data": "btn2"}
            ],
            [
                {"text": "URL", "url": "https://example.com"}
            ]
        ]
    }
}
response = requests.post(url, json=data)
```

## Reply Keyboard

Reply tugmalar bilan xabar yuborish.

```python
data = {
    "chat_id": chat_id,
    "text": "Menu:",
    "reply_markup": {
        "keyboard": [
            [{"text": "📱 Mahsulotlar"}],
            [{"text": "🛒 Savat"}, {"text": "👤 Profil"}]
        ],
        "resize_keyboard": True,
        "one_time_keyboard": False
    }
}
```

## Kontakt so'rash

```python
data = {
    "chat_id": chat_id,
    "text": "Telefon raqamingizni yuboring:",
    "reply_markup": {
        "keyboard": [
            [{"text": "📱 Telefon yuborish", "request_contact": True}]
        ],
        "resize_keyboard": True
    }
}
```

## Joylashuv so'rash

```python
data = {
    "chat_id": chat_id,
    "text": "Joylashuvingizni yuboring:",
    "reply_markup": {
        "keyboard": [
            [{"text": "📍 Joylashuv yuborish", "request_location": True}]
        ],
        "resize_keyboard": True
    }
}
```

## Chat a'zosini tekshirish

```python
url = f"https://api.telegram.org/bot{BOT_TOKEN}/getChatMember"
data = {
    "chat_id": "@channel_username",  # yoki ID
    "user_id": user_id
}
response = requests.post(url, json=data)
result = response.json()

if result["ok"]:
    status = result["result"]["status"]
    # member, administrator, creator, left, kicked
    is_member = status in ["member", "administrator", "creator"]
```

## Fayl yuklab olish

```python
# Fayl ma'lumotini olish
url = f"https://api.telegram.org/bot{BOT_TOKEN}/getFile"
data = {"file_id": file_id}
response = requests.post(url, json=data)
file_path = response.json()["result"]["file_path"]

# Faylni yuklab olish
download_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path}"
file_content = requests.get(download_url).content
```

## Xatolik boshqarish

```python
import requests

def call_telegram_api(method, data):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/{method}"
    try:
        response = requests.post(url, json=data, timeout=10)
        result = response.json()
        
        if result["ok"]:
            return result["result"]
        else:
            log(f"Telegram API xatolik: {result['description']}")
            return None
    except Exception as e:
        log(f"So'rov xatoligi: {e}")
        return None

# Ishlatish
result = call_telegram_api("sendMessage", {
    "chat_id": chat_id,
    "text": "Test"
})
```

## Rate Limits

Telegram API cheklovlari:

| Cheklov | Qiymat |
|---------|--------|
| Bir chatga | 1 xabar/soniya |
| Guruhga | 20 xabar/minutiga |
| Ommaviy yuborish | 30 xabar/soniya |

{% hint style="warning" %}
Cheklovlardan oshsangiz, `429 Too Many Requests` xatoligi olasiz.
{% endhint %}

## Keyingi

{% content-ref url="misollar.md" %}
[misollar.md](misollar.md)
{% endcontent-ref %}
