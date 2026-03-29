# Variable (O'zgaruvchi)

O'zgaruvchi yaratadi yoki mavjud o'zgaruvchini o'zgartiradi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Mantiq |
| **Node nomi** | Variable |
| **Fayl** | `VariableNode/VariableNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   📦 Variable   │
│   name = value  │
└────────┬────────┘
         ○ Source
```

## Xususiyatlar

### Name (Nom)

O'zgaruvchi nomi. Keyin `{{var.nom}}` orqali ishlatiladi.

**Qoidalar:**
- Kichik harflar va pastki chiziq
- Raqam bilan boshlanmasin
- Bo'sh joy yo'q

**Yaxshi:** `user_name`, `order_total`, `counter`
**Yomon:** `User Name`, `123var`, `my-var`

### Value (Qiymat)

O'zgaruvchiga beriladigan qiymat:

| Tur | Misol |
|-----|-------|
| Matn | `"Salom"` |
| Raqam | `100` |
| O'zgaruvchi | `{{message.text}}` |
| Hisoblash | `{{var.count}} + 1` |

### Operation (Amal)

| Amal | Tavsif | Misol |
|------|--------|-------|
| Set | Qiymat berish | `counter = 5` |
| Add | Qo'shish | `counter = counter + 5` |
| Subtract | Ayirish | `counter = counter - 1` |
| Multiply | Ko'paytirish | `price = price * 0.9` |
| Divide | Bo'lish | `avg = total / count` |
| Append | Matn qo'shish | `text = text + " yangi"` |

## Misollar

### Oddiy qiymat

**Name:** `greeting`
**Value:** `Salom`
**Operation:** Set

Keyin: `{{var.greeting}}` → `Salom`

### Foydalanuvchi ma'lumoti

**Name:** `user_name`
**Value:** `{{user.first_name}}`
**Operation:** Set

### Counter (Sanagich)

**Boshlang'ich qiymat:**
**Name:** `counter`
**Value:** `0`
**Operation:** Set

**Oshirish:**
**Name:** `counter`
**Value:** `1`
**Operation:** Add

### Hisoblash

**Name:** `total`
**Value:** `{{var.price}} * {{var.quantity}}`
**Operation:** Set

## O'zgaruvchi turlari

### Session variable

Foydalanuvchi sessiyasida saqlanadi. Sessiya tugagach yo'qoladi.

```
{{var.temporary_data}}
```

### Persistent variable

Ma'lumotlar bazasida saqlanadi. Doimiy.

{% hint style="info" %}
Doimiy saqlash uchun **State** node yoki **Collection** ishlating.
{% endhint %}

## O'zgaruvchilar orasida

Bir o'zgaruvchida boshqasini ishlating:

```
Name: full_name
Value: {{var.first_name}} {{var.last_name}}
```

## Massivlar

Variable node oddiy qiymatlar uchun. Massivlar uchun Custom Code ishlating:

```python
# Massiv yaratish
items = ["olma", "nok", "uzum"]
set_var("fruits", items)

# Massivga qo'shish
fruits = get_var("fruits")
fruits.append("anor")
set_var("fruits", fruits)
```

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- Tushunarli nomlar bering (`order_total` vs `x`)
- Bir joyda yarating, ko'p joyda ishlating
- Sanagichlarni 0 dan boshlang

### ❌ Noto'g'ri

- Bir xil nomli o'zgaruvchilar yaratmang
- Juda ko'p o'zgaruvchi yaratmang (esda saqlash qiyin)

## Keyingi

{% content-ref url="state-node.md" %}
[state-node.md](state-node.md)
{% endcontent-ref %}
