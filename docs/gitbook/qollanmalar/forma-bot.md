# Forma to'ldirish bot

**Daraja:** 🟡 O'rta
**Vaqt:** 25 daqiqa

## Natija

Foydalanuvchidan ketma-ket ma'lumot yig'uvchi bot (ro'yxatdan o'tish).

## 2 usul

### 1-usul: Form node

Tayyor Form node ishlatish — tez va oson.

### 2-usul: State + Trigger

Qo'lda qurish — moslashuvchan.

---

## 1-usul: Form node

### Qadam 1: /register

**Command Trigger:**
- Command: `register`
- Global: ✅

### Qadam 2: Form node

**Form** node'ini ulang:

**Maydonlar:**

1. **name**
   - Label: "Ismingizni kiriting:"
   - Type: text
   - Required: ✅

2. **phone**
   - Label: "Telefon raqamingiz:"
   - Type: phone
   - Required: ✅

3. **email**
   - Label: "Email (ixtiyoriy):"
   - Type: email
   - Required: ❌

### Qadam 3: Natija xabari

Form'dan keyin **Text Message**:

```
✅ Ro'yxatdan o'tdingiz!

Ism: {{form.name}}
Telefon: {{form.phone}}
Email: {{form.email}}

Rahmat!
```

---

## 2-usul: State + Trigger

### Qadam 1: /register

**Command Trigger** → **Text Message**:
```
📝 Ro'yxatdan o'tish

Ismingizni kiriting:
```

→ **State**: `waiting_name`

### Qadam 2: Ism olish

**Message Trigger:**
- Type: text
- Filter: any
- Global: ❌ (faqat `waiting_name` state'da)

→ **Variable**: `name = {{message.text}}`

→ **Text Message**:
```
Telefon raqamingizni kiriting:
(Masalan: +998901234567)
```

→ **State**: `waiting_phone`

### Qadam 3: Telefon olish

**Message Trigger:**
- Type: text
- Filter: regex
- Regex: `^\+?[0-9]{10,15}$`

→ **Variable**: `phone = {{message.text}}`

→ **Text Message**:
```
Email kiriting (yoki /skip bosing):
```

→ **State**: `waiting_email`

### Qadam 4: Noto'g'ri telefon

**Message Trigger** (Else handle):

→ **Text Message**:
```
❌ Noto'g'ri format!

Iltimos, to'g'ri telefon raqam kiriting:
+998901234567
```

(State o'zgarmaydi — qayta so'raladi)

### Qadam 5: Email olish

**Message Trigger:**
- Type: text
- Filter: regex
- Regex: `^[\w.-]+@[\w.-]+\.\w+$`

→ **Variable**: `email = {{message.text}}`

→ Natija xabari (6-qadam)

### Qadam 6: /skip

**Command Trigger:**
- Command: `skip`
- Global: ❌ (faqat `waiting_email`)

→ **Variable**: `email = ""`

→ Natija xabari

### Qadam 7: Natija

**Text Message:**
```
✅ Ro'yxatdan o'tdingiz!

Ism: {{var.name}}
Telefon: {{var.phone}}
Email: {{var.email}}
```

→ **State**: `main`

---

## Oqim sxemasi (2-usul)

```
    /register
        │
        ▼
  ┌───────────────┐
  │ "Ism kiriting"│
  │ State: wait_  │
  │        name   │
  └───────┬───────┘
          │
          ▼
┌─────────────────────┐
│ Message Trigger     │
│ (any text)          │
└─────────┬───────────┘
          │
          ▼
  ┌───────────────┐
  │ var.name =    │
  │ {{message}}   │
  └───────┬───────┘
          │
          ▼
  ┌───────────────┐
  │ "Telefon     │
  │  kiriting"    │
  │ State: wait_  │
  │        phone  │
  └───────┬───────┘
          │
    ┌─────┴─────┐
    │           │
  Match       Else
    │           │
    ▼           ▼
 ┌─────┐    ┌─────┐
 │Email│    │Xato!│
 │so'ra│    │Qayta│
 └─────┘    └─────┘
```

## Ma'lumotni saqlash

### Kolleksiyaga

```
┌─────────────────┐
│   Collection    │
│ create: users   │
│ telegram_id:    │
│  {{user.id}}    │
│ name: {{var.    │
│        name}}   │
│ phone: {{var.   │
│        phone}}  │
└─────────────────┘
```

### Adminga yuborish

```
┌─────────────────┐
│ Send to Admin   │
│ "Yangi ro'yxat: │
│  {{var.name}}   │
│  {{var.phone}}" │
└─────────────────┘
```

## Keyingi

{% content-ref url="obuna-bot.md" %}
[obuna-bot.md](obuna-bot.md)
{% endcontent-ref %}
