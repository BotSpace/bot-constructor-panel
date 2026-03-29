# Mantiq

**Mantiq node'lari** — bu bot oqimini boshqaruvchi, shartlarni tekshiruvchi va ma'lumotlar bilan ishlovchi bloklar.

## Mantiq turlari

### Shartlar

| Node | Tavsif |
|------|--------|
| [If](if-node.md) | Shartli mantiq |
| Else If | Qo'shimcha shart |
| Else | Boshqa holat |

### Ma'lumotlar

| Node | Tavsif |
|------|--------|
| [Variable](variable-node.md) | O'zgaruvchi yaratish/o'zgartirish |
| [State](state-node.md) | Foydalanuvchi holati |
| Collection | Kolleksiya bilan ishlash |
| Load Collection Item | Element yuklash |

### Oqim boshqaruvi

| Node | Tavsif |
|------|--------|
| [For Loop](for-loop.md) | Tsikl |
| [Delay](delay-node.md) | Kutish |
| [Random](random-node.md) | Tasodifiy tanlash |
| SubFlow | Boshqa oqimga o'tish |
| SubFlow Exit | Oqimdan chiqish |

### Integratsiyalar

| Node | Tavsif |
|------|--------|
| [HTTP Request](http-request.md) | API so'rov |
| [Form](form-node.md) | Forma to'plash |
| Check Membership | Kanal obunasini tekshirish |
| Callback Answer | Callback javob |

### Kod

| Node | Tavsif |
|------|--------|
| [Custom Code](custom-code.md) | Python kod |

## Mantiq va oqim

Mantiq node'lari bot oqimini boshqaradi:

```
        Trigger
           │
           ▼
      ┌────────────┐
      │     If     │
      │ shart to'g'ri?│
      └────┬───┬───┘
           │   │
      Ha   │   │  Yo'q
           ▼   ▼
      ┌───────┐  ┌───────┐
      │Action1│  │Action2│
      └───────┘  └───────┘
```

## Handle'lar

Mantiq node'larida turli handle konfiguratsiyalari bor:

### Oddiy node (Variable, State)

```
       ○ Target
┌─────────────────┐
│     Node        │
└────────┬────────┘
         ○ Source
```

### Shartli node (If)

```
       ○ Target
┌─────────────────┐
│       If        │
└────┬───────┬────┘
     ○       ○
   True    False
```

### Loop node (For Loop)

```
       ○ Target
┌─────────────────┐
│   For Loop      │
└────┬───────┬────┘
     ○       ○
   Body    Done
```

## O'zgaruvchilar

Mantiq node'larida o'zgaruvchilar muhim rol o'ynaydi:

### Oldindan belgilangan

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{user.id}}` | Foydalanuvchi ID |
| `{{user.first_name}}` | Ism |
| `{{message.text}}` | Xabar matni |
| `{{callback.data}}` | Callback qiymati |

### Foydalanuvchi yaratgan

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `{{var.nom}}` | Variable node bilan yaratilgan |
| `{{state.nom}}` | State'da saqlangan |
| `{{loop.item}}` | Joriy loop elementi |

## Keyingi

{% content-ref url="if-node.md" %}
[if-node.md](if-node.md)
{% endcontent-ref %}
