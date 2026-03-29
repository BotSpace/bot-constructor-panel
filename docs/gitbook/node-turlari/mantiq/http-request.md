# HTTP Request

Tashqi API'ga so'rov yuboradi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Mantiq |
| **Node nomi** | HTTP Request |
| **Fayl** | `HTTPRequestNode/HTTPRequestNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   🌐 HTTP       │
│   Request       │
└────┬───────┬────┘
     ○       ○
  Success  Error
```

## Handle'lar

| Handle | Vazifa |
|--------|--------|
| Target | Kirish |
| Success | So'rov muvaffaqiyatli |
| Error | Xatolik yuz berdi |

## Xususiyatlar

### URL

So'rov manzili:
```
https://api.example.com/users
```

O'zgaruvchilar bilan:
```
https://api.example.com/users/{{user.id}}
```

### Method (Metod)

| Metod | Vazifa |
|-------|--------|
| GET | Ma'lumot olish |
| POST | Yangi yaratish |
| PUT | Yangilash |
| PATCH | Qisman yangilash |
| DELETE | O'chirish |

### Headers

HTTP headerlar:

| Header | Qiymat |
|--------|--------|
| Content-Type | application/json |
| Authorization | Bearer {{var.token}} |

### Body

POST, PUT, PATCH uchun so'rov tanasi:

```json
{
  "user_id": "{{user.id}}",
  "name": "{{var.name}}",
  "email": "{{var.email}}"
}
```

### Response Variable

Javob saqlanadigan o'zgaruvchi nomi (default: `response`).

## Misollar

### GET so'rov

**URL:** `https://api.example.com/weather?city=Tashkent`
**Method:** GET

**Javobni ishlatish:**
```
Bugun: {{var.response.temperature}}°C
```

### POST so'rov

**URL:** `https://api.example.com/orders`
**Method:** POST
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{var.api_key}}
```
**Body:**
```json
{
  "product_id": "{{var.product_id}}",
  "quantity": {{var.quantity}},
  "user_id": "{{user.id}}"
}
```

### Webhook yuborish

**URL:** `https://your-server.com/webhook`
**Method:** POST
**Body:**
```json
{
  "event": "new_user",
  "user_id": "{{user.id}}",
  "username": "{{user.username}}",
  "timestamp": "{{var.timestamp}}"
}
```

## Javob bilan ishlash

### Javob tuzilishi

```json
{
  "status": "success",
  "data": {
    "id": 123,
    "name": "Product"
  }
}
```

**Ishlatish:**
```
{{var.response.status}} → "success"
{{var.response.data.id}} → 123
{{var.response.data.name}} → "Product"
```

### Xatolik tekshirish

```
┌─────────────────┐
│   HTTP Request  │
└────┬───────┬────┘
     │       │
  Success  Error
     │       │
     ▼       ▼
┌─────────┐ ┌─────────┐
│ Natija  │ │ Xatolik │
│ ko'rsat │ │ xabari  │
└─────────┘ └─────────┘
```

## Autentifikatsiya

### API Key

**Headers:**
```
X-API-Key: {{var.api_key}}
```

### Bearer Token

**Headers:**
```
Authorization: Bearer {{var.access_token}}
```

### Basic Auth

**Headers:**
```
Authorization: Basic {{var.base64_credentials}}
```

## Timeout

So'rov kutish vaqti. Default: 30 soniya.

{% hint style="warning" %}
Sekin API'lar timeout'ga urilishi mumkin.
{% endhint %}

## Eng yaxshi amaliyotlar

### ✅ To'g'ri

- Error handle'ni to'ldiring
- Timeout'ni o'rnating
- API kalitlarini xavfsiz saqlang
- Response'ni tekshiring

### ❌ Noto'g'ri

- Error'ni e'tiborsiz qoldirmang
- API kalitlarini ochiq yozmang
- Juda ko'p so'rov yuborish

## Keyingi

{% content-ref url="form-node.md" %}
[form-node.md](form-node.md)
{% endcontent-ref %}
