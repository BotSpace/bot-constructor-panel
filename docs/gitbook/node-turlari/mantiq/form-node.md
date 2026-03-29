# Form (Forma)

Foydalanuvchidan ketma-ket ma'lumotlar to'playdi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Mantiq |
| **Node nomi** | Form |
| **Fayl** | `FormNode/FormNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   📝 Form       │
│   3 ta savol    │
└────────┬────────┘
         ○ Source
```

## Nima uchun Form?

Odatda ketma-ket savollar uchun ko'p State va Trigger kerak:

```
Ism so'ra → State → Trigger → Telefon so'ra → State → Trigger → ...
```

Form node bularni bittaga birlashtiradi:

```
Form (ism, telefon, email) → Natija
```

## Xususiyatlar

### Fields (Maydonlar)

Har bir maydon uchun:

| Xususiyat | Tavsif |
|-----------|--------|
| **Name** | Maydon nomi (masalan: `name`) |
| **Label** | Savol matni (masalan: "Ismingiz:") |
| **Type** | Qiymat turi |
| **Required** | Majburiyligi |
| **Validation** | Tekshirish qoidasi |

### Maydon turlari

| Tur | Tavsif |
|-----|--------|
| text | Oddiy matn |
| number | Faqat raqam |
| email | Email formatda |
| phone | Telefon raqami |
| date | Sana |
| photo | Rasm |
| location | Joylashuv |
| contact | Kontakt |

### Validation (Tekshirish)

| Qoida | Tavsif |
|-------|--------|
| required | Bo'sh bo'lmasligi |
| min_length | Minimal uzunlik |
| max_length | Maksimal uzunlik |
| regex | Regular expression |

## Misollar

### Ro'yxatdan o'tish

**Maydonlar:**

1. **name**
   - Label: "Ismingizni kiriting:"
   - Type: text
   - Required: ✅

2. **phone**
   - Label: "Telefon raqamingiz:"
   - Type: phone
   - Required: ✅
   - Regex: `^\+?[0-9]{10,15}$`

3. **email**
   - Label: "Email (ixtiyoriy):"
   - Type: email
   - Required: ❌

### Buyurtma formasi

**Maydonlar:**

1. **product**
   - Label: "Mahsulot nomini yozing:"
   - Type: text

2. **quantity**
   - Label: "Nechta kerak?"
   - Type: number

3. **address**
   - Label: "Yetkazish manzili:"
   - Type: text

4. **location**
   - Label: "Joylashuvingizni yuboring:"
   - Type: location

## Natijalar

Form tugagandan keyin barcha javoblar o'zgaruvchilarda:

```
{{form.name}} → "Jamshid"
{{form.phone}} → "+998901234567"
{{form.email}} → "jamshid@example.com"
```

## Bekor qilish

Forma davomida foydalanuvchi `/cancel` yozsa:

- Forma to'xtatiladi
- Global `/cancel` trigger ishlaydi

## Xatolik xabarlari

Noto'g'ri kiritish uchun:

```
Iltimos, to'g'ri telefon raqam kiriting!
Masalan: +998901234567
```

## Forma oqimi

```
Form boshlanadi
    │
    ▼
Savol 1: Ism → Foydalanuvchi javob beradi
    │
    ▼
Savol 2: Telefon → Foydalanuvchi javob beradi
    │               │
    │               ▼ (noto'g'ri)
    │           Xatolik xabari
    │               │
    │               ▼
    │           Qayta so'raydi
    │
    ▼
Savol 3: Email → Foydalanuvchi javob beradi
    │
    ▼
Form tugadi → Natijalar tayyor
```

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- Aniq savol matnlari
- Validation qo'shing
- 3-5 ta savol optimal
- `/cancel` imkoniyatini ayting

### ❌ Noto'g'ri

- Juda ko'p savol (foydalanuvchi charchaydi)
- Notushurnarli savol matnlari
- Validationsiz

## Keyingi

{% content-ref url="custom-code.md" %}
[custom-code.md](custom-code.md)
{% endcontent-ref %}
