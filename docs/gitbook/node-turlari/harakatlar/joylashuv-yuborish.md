# Joylashuv yuborish

Foydalanuvchiga joylashuv (lokatsiya) yuboradi.

## Asosiy ma'lumot

| Xususiyat | Qiymat |
|-----------|--------|
| **Kategoriya** | Harakat |
| **Node nomi** | Location |
| **Fayl** | `LocationNode/LocationNode.tsx` |

## Ko'rinishi

```
       ○ Target
┌─────────────────┐
│   📍 Joylashuv  │
│    Location     │
└────────┬────────┘
         ○ Source
```

## Xususiyatlar

### Latitude (Kenglik)

Geografik kenglik (-90 dan 90 gacha).

**Misol:** `41.311081`

### Longitude (Uzunlik)

Geografik uzunlik (-180 dan 180 gacha).

**Misol:** `69.240562`

### Horizontal Accuracy

Joylashuv aniqiligi metrda (ixtiyoriy, 0-1500).

### Live Period

Jonli joylashuv davomiyligi sekundlarda (ixtiyoriy).

| Qiymat | Ma'no |
|--------|-------|
| Yo'q | Oddiy joylashuv |
| 60-86400 | Jonli joylashuv |

### Heading

Yo'nalish darajada (0-360, ixtiyoriy).

### Proximity Alert Radius

Yaqinlik ogohlantirish radiusi metrda (ixtiyoriy).

## Misollar

### Oddiy joylashuv

**Latitude:** `41.311081`
**Longitude:** `69.240562`

Bu Toshkent markazining koordinatalari.

### O'zgaruvchidan

**Latitude:** `{{var.lat}}`
**Longitude:** `{{var.lng}}`

### Kelgan joylashuvni yuborish

**Latitude:** `{{message.location.latitude}}`
**Longitude:** `{{message.location.longitude}}`

## O'zgaruvchilar

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{message.location.latitude}}` | Kelgan kenglik |
| `{{message.location.longitude}}` | Kelgan uzunlik |

## Keyingi

{% content-ref url="kontakt-yuborish.md" %}
[kontakt-yuborish.md](kontakt-yuborish.md)
{% endcontent-ref %}
