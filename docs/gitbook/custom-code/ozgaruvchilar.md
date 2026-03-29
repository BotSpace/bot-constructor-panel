# O'zgaruvchilar

Bot Constructor'da o'zgaruvchilar tizimi haqida batafsil.

## O'zgaruvchi turlari

### 1. Tizim o'zgaruvchilari

Bot Constructor avtomatik yaratadigan o'zgaruvchilar.

#### Foydalanuvchi (`user`)

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{user.id}}` | Telegram user ID |
| `{{user.first_name}}` | Ism |
| `{{user.last_name}}` | Familiya |
| `{{user.username}}` | @username |
| `{{user.language_code}}` | Til kodi (uz, ru, en) |
| `{{user.is_bot}}` | Bot ekanligini tekshirish |

#### Xabar (`message`)

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.id}}` | Xabar ID |
| `{{message.text}}` | Xabar matni |
| `{{message.type}}` | Xabar turi |
| `{{message.date}}` | Yuborilgan sana |

#### Media

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.photo.file_id}}` | Rasm ID |
| `{{message.video.file_id}}` | Video ID |
| `{{message.audio.file_id}}` | Audio ID |
| `{{message.document.file_id}}` | Fayl ID |
| `{{message.document.file_name}}` | Fayl nomi |

#### Joylashuv

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.location.latitude}}` | Kenglik |
| `{{message.location.longitude}}` | Uzunlik |

#### Kontakt

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.contact.phone_number}}` | Telefon |
| `{{message.contact.first_name}}` | Ism |

#### Chat (`chat`)

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{chat.id}}` | Chat ID |
| `{{chat.type}}` | Chat turi (private, group, channel) |
| `{{chat.title}}` | Chat nomi (guruhlar uchun) |

#### Callback (`callback`)

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{callback.data}}` | Callback ma'lumoti |
| `{{callback.id}}` | Callback ID |
| `{{callback.message_id}}` | Xabar ID |

#### Trigger (`trigger`)

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{trigger.command}}` | Buyruq nomi |
| `{{trigger.args}}` | Buyruq argumentlari |

### 2. Foydalanuvchi o'zgaruvchilari (`var`)

Variable node yoki Custom Code orqali yaratilgan.

```
{{var.name}} — "Jamshid"
{{var.counter}} — 5
{{var.items}} — ["olma", "nok"]
```

### 3. Holat o'zgaruvchilari (`state`)

State node orqali saqlangan.

```
{{state.name}} — "main"
{{state.data.product_id}} — 123
```

### 4. Loop o'zgaruvchilari (`loop`)

For Loop ichida mavjud.

```
{{loop.item}} — Joriy element
{{loop.index}} — Joriy indeks (0 dan boshlanadi)
```

### 5. Form o'zgaruvchilari (`form`)

Form tugagandan keyin mavjud.

```
{{form.name}} — Forma maydoni qiymati
{{form.phone}} — Telefon raqami
```

### 6. HTTP Response (`response`)

HTTP Request'dan keyin mavjud.

```
{{var.response}} — To'liq javob
{{var.response.data}} — Data qismi
{{var.response.status}} — Status
```

## Custom Code'da ishlatish

### Olish

```python
# get_var bilan
name = get_var("var.name")
user_id = get_var("user.id")
text = get_var("message.text")

# To'g'ridan-to'g'ri
user = get_user()
message = get_message()
```

### O'rnatish

```python
# Oddiy qiymat
set_var("name", "Jamshid")
set_var("count", 10)

# Murakkab qiymat
set_var("user_data", {
    "name": "Ali",
    "scores": [90, 85, 95]
})
```

## Node'larda ishlatish

### Text Message

```
Salom, {{user.first_name}}!

Sizning ID: {{user.id}}
Hisob: {{var.balance}} so'm
```

### If Node

```
Variable: {{var.age}}
Operator: >
Value: 18
```

### URL'da

```
https://api.example.com/users/{{user.id}}
```

### JSON body'da

```json
{
  "user_id": "{{user.id}}",
  "name": "{{var.name}}",
  "action": "{{callback.data}}"
}
```

## Arifmetik amallar

Variable node'da oddiy amallar:

```
{{var.count}} + 1
{{var.price}} * 0.9
{{var.total}} / {{var.quantity}}
```

Murakkab hisoblashlar uchun Custom Code ishlating.

## Default qiymatlar

Agar o'zgaruvchi mavjud bo'lmasa:

```python
# Custom Code'da
name = get_var("var.name") or "Mehmon"

# Node'larda ishlamaydi — tekshiring
```

## Debug

O'zgaruvchilarni ko'rish:

```python
log(f"User: {get_user()}")
log(f"Message: {get_message()}")
log(f"Name: {get_var('var.name')}")
```

## Keyingi

{% content-ref url="telegram-api.md" %}
[telegram-api.md](telegram-api.md)
{% endcontent-ref %}
