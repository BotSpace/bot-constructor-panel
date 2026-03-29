# Kolleksiya yaratish

## Yangi kolleksiya

1. Chap menyudan **Kolleksiyalar** sahifasiga o'ting
2. **"+ Yangi kolleksiya"** tugmasini bosing
3. Kolleksiya nomini kiriting

### Nom qoidalari

- Kichik harflar
- Pastki chiziq ruxsat
- Bo'sh joy yo'q
- Raqam bilan boshlanmasin

**Yaxshi:** `products`, `user_orders`, `faq_items`
**Yomon:** `My Products`, `123items`

## Maydonlar

Har bir kolleksiyada maydonlar bo'ladi:

### Maydon turlari

| Tur | Tavsif | Misol |
|-----|--------|-------|
| Text | Matn | "iPhone 15" |
| Number | Raqam | 999 |
| Boolean | Ha/Yo'q | true/false |
| Date | Sana | "2024-01-15" |
| URL | Havola | "https://..." |
| Image | Rasm URL | "https://.../img.jpg" |
| JSON | Murakkab data | {...} |

### Maydon xususiyatlari

| Xususiyat | Tavsif |
|-----------|--------|
| **Name** | Maydon nomi |
| **Type** | Turi |
| **Required** | Majburiy |
| **Default** | Standart qiymat |

## Misollar

### Products kolleksiyasi

| Maydon | Tur | Required |
|--------|-----|----------|
| name | Text | ✅ |
| description | Text | ❌ |
| price | Number | ✅ |
| image | Image | ❌ |
| category | Text | ❌ |
| in_stock | Boolean | ✅ |

### Users kolleksiyasi

| Maydon | Tur | Required |
|--------|-----|----------|
| telegram_id | Number | ✅ |
| first_name | Text | ✅ |
| phone | Text | ❌ |
| registered_at | Date | ✅ |
| is_active | Boolean | ✅ |

### Orders kolleksiyasi

| Maydon | Tur | Required |
|--------|-----|----------|
| user_id | Number | ✅ |
| product_id | Text | ✅ |
| quantity | Number | ✅ |
| total | Number | ✅ |
| status | Text | ✅ |
| created_at | Date | ✅ |

## Kolleksiyani tahrirlash

1. Kolleksiyalar ro'yxatida kolleksiyani tanlang
2. **"Sozlamalar"** (⚙️) tugmasini bosing
3. Maydonlarni qo'shing, tahrirlang yoki o'chiring

{% hint style="warning" %}
Mavjud ma'lumotlar bo'lgan maydonni o'chirsangiz, u ma'lumotlar ham yo'qoladi!
{% endhint %}

## Kolleksiyani o'chirish

1. Kolleksiya sozlamalarini oching
2. Pastda **"Kolleksiyani o'chirish"** tugmasini bosing
3. Tasdiqlang

{% hint style="danger" %}
O'chirilgan kolleksiyani tiklash mumkin emas!
{% endhint %}

## Keyingi

{% content-ref url="malumot-qoshish.md" %}
[malumot-qoshish.md](malumot-qoshish.md)
{% endcontent-ref %}
