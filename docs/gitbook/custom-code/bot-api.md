# Bot API metodlari

Custom Code node'da ishlatish mumkin bo'lgan funksiyalar.

## O'zgaruvchilar

### get_var(name)

O'zgaruvchi qiymatini oladi.

```python
# Oddiy o'zgaruvchi
name = get_var("var.name")

# Foydalanuvchi ma'lumoti
user_id = get_var("user.id")
first_name = get_var("user.first_name")

# Xabar ma'lumoti
text = get_var("message.text")
message_id = get_var("message.id")

# Callback ma'lumoti
callback_data = get_var("callback.data")

# State ma'lumoti
current_state = get_var("state.name")
```

### set_var(name, value)

O'zgaruvchiga qiymat beradi.

```python
# Oddiy qiymat
set_var("result", 100)
set_var("name", "Jamshid")

# Ro'yxat
set_var("items", [1, 2, 3])

# Lug'at
set_var("user_data", {"name": "Ali", "age": 25})
```

## Foydalanuvchi

### get_user()

Foydalanuvchi ma'lumotlarini qaytaradi.

```python
user = get_user()

print(user["id"])           # Telegram ID
print(user["first_name"])   # Ism
print(user["last_name"])    # Familiya (bo'lishi mumkin)
print(user["username"])     # Username (bo'lishi mumkin)
print(user["language_code"]) # Til kodi
```

## Xabar

### get_message()

Kelgan xabar ma'lumotlarini qaytaradi.

```python
message = get_message()

print(message["id"])        # Xabar ID
print(message["text"])      # Matn
print(message["chat_id"])   # Chat ID
print(message["date"])      # Sana
```

### send_message(chat_id, text, **kwargs)

Xabar yuboradi.

```python
# Oddiy xabar
send_message(chat_id, "Salom!")

# HTML formatli
send_message(chat_id, "<b>Qalin</b> matn", parse_mode="HTML")

# Ovozsiz
send_message(chat_id, "Xabar", disable_notification=True)

# Javob sifatida
send_message(chat_id, "Javob", reply_to_message_id=123)
```

### send_photo(chat_id, photo, **kwargs)

Rasm yuboradi.

```python
# URL orqali
send_photo(chat_id, "https://example.com/image.jpg")

# Izoh bilan
send_photo(chat_id, photo_url, caption="Mening rasmim")
```

### send_document(chat_id, document, **kwargs)

Hujjat yuboradi.

```python
send_document(chat_id, "https://example.com/file.pdf", caption="PDF fayl")
```

### edit_message(chat_id, message_id, text, **kwargs)

Xabarni tahrirlaydi.

```python
edit_message(chat_id, msg_id, "Yangi matn")
edit_message(chat_id, msg_id, "<b>HTML</b>", parse_mode="HTML")
```

### delete_message(chat_id, message_id)

Xabarni o'chiradi.

```python
delete_message(chat_id, msg_id)
```

### answer_callback_query(callback_id, text, **kwargs)

Callback query'ga javob beradi.

```python
# Oddiy javob
answer_callback_query(callback_id, "Tanlandi!")

# Alert bilan
answer_callback_query(callback_id, "Muhim xabar!", show_alert=True)
```

## Kolleksiyalar

### get_collection(name)

Kolleksiya elementlarini qaytaradi.

```python
users = get_collection("users")

for user in users:
    print(user["name"])
    print(user["email"])
```

### add_to_collection(name, data)

Kolleksiyaga element qo'shadi.

```python
new_user = {
    "name": "Jamshid",
    "email": "jamshid@example.com",
    "age": 25
}
add_to_collection("users", new_user)
```

### update_collection_item(name, item_id, data)

Elementni yangilaydi.

```python
update_collection_item("users", user_id, {
    "age": 26,
    "updated_at": "2024-01-01"
})
```

### delete_from_collection(name, item_id)

Elementni o'chiradi.

```python
delete_from_collection("users", user_id)
```

### find_in_collection(name, query)

Kolleksiyadan qidiradi.

```python
# Email bo'yicha qidirish
users = find_in_collection("users", {"email": "test@example.com"})

# Yoshga qarab
adults = find_in_collection("users", {"age": {"$gte": 18}})
```

## State

### set_state(name, data=None)

Foydalanuvchi holatini o'rnatadi.

```python
# Oddiy holat
set_state("main")

# Ma'lumot bilan
set_state("editing", {"product_id": 123})
```

### get_state()

Joriy holatni qaytaradi.

```python
state = get_state()
print(state["name"])  # Holat nomi
print(state["data"])  # Holat ma'lumoti
```

## Yordamchi funksiyalar

### log(message)

Debug uchun log yozadi.

```python
log("Bu debug xabar")
log(f"User ID: {user_id}")
```

### sleep(seconds)

Kutish (pauza).

```python
sleep(2)  # 2 soniya kutish
```

{% hint style="warning" %}
`sleep()` ni ortiqcha ishlatmang — oqim sekinlashadi.
{% endhint %}

## Keyingi

{% content-ref url="ozgaruvchilar.md" %}
[ozgaruvchilar.md](ozgaruvchilar.md)
{% endcontent-ref %}
