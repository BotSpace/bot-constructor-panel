# If (Shart)

Shartni tekshirib, oqimni ikki yo'lga bo'ladi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Mantiq |
| **Node nomi** | If / Condition |
| **Fayl** | `ConditionNode/ConditionNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│       If        │
│   shart: ...    │
└────┬───────┬────┘
     ○       ○
   True    False
```

## Handle'lar

| Handle | Pozitsiya | Vazifa |
|--------|-----------|--------|
| Target | Tepa | Kirish |
| True | Chap-past | Shart to'g'ri |
| False | O'ng-past | Shart noto'g'ri |

## Xususiyatlar

### Variable (O'zgaruvchi)

Tekshiriladigan qiymat:
- `{{user.id}}`
- `{{message.text}}`
- `{{var.counter}}`
- `{{callback.data}}`

### Operator

| Operator | Ma'no | Misol |
|----------|-------|-------|
| `==` | Teng | `{{var.x}} == 5` |
| `!=` | Teng emas | `{{var.x}} != 0` |
| `>` | Katta | `{{var.age}} > 18` |
| `<` | Kichik | `{{var.price}} < 100` |
| `>=` | Katta yoki teng | `{{var.score}} >= 60` |
| `<=` | Kichik yoki teng | `{{var.count}} <= 10` |
| `contains` | Ichida bor | `{{message.text}} contains "salom"` |
| `starts_with` | Boshlanadi | `{{message.text}} starts_with "/"` |
| `ends_with` | Tugaydi | `{{message.text}} ends_with "?"` |
| `is_empty` | Bo'sh | `{{var.name}} is_empty` |
| `is_not_empty` | Bo'sh emas | `{{var.email}} is_not_empty` |
| `regex` | Regex mos | `{{message.text}} regex "^[0-9]+$"` |

### Value (Qiymat)

Taqqoslanadigan qiymat:
- Matn: `"salom"`
- Raqam: `100`
- O'zgaruvchi: `{{var.limit}}`

## Misollar

### Obunani tekshirish

```
┌─────────────────┐
│       If        │
│ user.subscribed │
│    == true      │
└────┬───────┬────┘
     │       │
   True    False
     │       │
     ▼       ▼
┌───────┐ ┌───────┐
│Kontent│ │Obuna  │
│ko'rsat│ │so'ra  │
└───────┘ └───────┘
```

### Yoshni tekshirish

```
┌─────────────────┐
│       If        │
│   var.age > 18  │
└────┬───────┬────┘
     │       │
   True    False
     │       │
     ▼       ▼
┌───────┐ ┌───────┐
│Ruxsat │ │Ruxsat │
│ beril │ │ yo'q  │
└───────┘ └───────┘
```

### Matnni tekshirish

```
┌─────────────────┐
│       If        │
│ message.text    │
│ contains "yordam"│
└────┬───────┬────┘
     │       │
   True    False
     │       │
     ▼       ▼
┌───────┐ ┌───────┐
│Yordam │ │Oddiy  │
│xabari │ │javob  │
└───────┘ └───────┘
```

### Bo'shlikni tekshirish

```
┌─────────────────┐
│       If        │
│   var.email     │
│   is_not_empty  │
└────┬───────┬────┘
     │       │
   True    False
     │       │
     ▼       ▼
┌───────┐ ┌───────┐
│Davom  │ │Email  │
│ etish │ │ so'ra │
└───────┘ └───────┘
```

## Else If va Else

Bir nechta shartlarni ketma-ket tekshirish:

```
┌─────────────────┐
│       If        │
│  score >= 90    │
└────┬───────┬────┘
     │       │
   True    False
     │       │
     ▼       ▼
┌───────┐ ┌─────────────┐
│  "A"  │ │   Else If   │
└───────┘ │ score >= 80 │
          └────┬───┬────┘
               │   │
             True False
               │   │
               ▼   ▼
          ┌───────┐ ┌───────┐
          │  "B"  │ │  "C"  │
          └───────┘ └───────┘
```

## Murakkab shartlar

Custom Code node bilan murakkab mantiqni amalga oshiring:

```python
# Custom Code
age = int(get_var("age"))
country = get_var("country")

if age >= 18 and country == "UZ":
    set_var("eligible", True)
else:
    set_var("eligible", False)
```

Keyin oddiy If node:
```
If: var.eligible == true
```

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- Oddiy shartlardan boshlang
- Murakkab mantiqni Custom Code'ga oling
- Har bir yo'lni to'ldiring (True va False)

### ❌ Noto'g'ri

- Juda ko'p ichma-ich If ishlatmang
- False yo'lini bo'sh qoldirmang

## Keyingi

{% content-ref url="variable-node.md" %}
[variable-node.md](variable-node.md)
{% endcontent-ref %}
