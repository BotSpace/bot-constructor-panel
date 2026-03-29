# Kontakt yuborish

Foydalanuvchiga kontakt ma'lumotlarini yuboradi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Harakat |
| **Node nomi** | Contact |
| **Fayl** | `ContactNode/ContactNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   👤 Kontakt    │
│     Contact     │
└────────┬────────┘
         ○ Source
```

## Xususiyatlar

### Phone Number (Telefon raqami)

Telefon raqami xalqaro formatda.

**Misol:** `+998901234567`

### First Name (Ism)

Kontakt ismi (majburiy).

### Last Name (Familiya)

Familiya (ixtiyoriy).

### vCard

vCard formatidagi qo'shimcha ma'lumotlar (ixtiyoriy).

## Misollar

### Oddiy kontakt

**Phone Number:** `+998901234567`
**First Name:** `Jamshid`
**Last Name:** `Abdullayev`

### Admin kontakti

**Phone Number:** `+998991234567`
**First Name:** `Qo'llab-quvvatlash`

### Kelgan kontaktni yuborish

**Phone Number:** `{{message.contact.phone_number}}`
**First Name:** `{{message.contact.first_name}}`

## O'zgaruvchilar

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.contact.phone_number}}` | Kelgan telefon |
| `{{message.contact.first_name}}` | Kelgan ism |
| `{{message.contact.last_name}}` | Kelgan familiya |
| `{{message.contact.user_id}}` | Telegram user ID |

## Keyingi

{% content-ref url="xabar-tahrirlash.md" %}
[xabar-tahrirlash.md](xabar-tahrirlash.md)
{% endcontent-ref %}
