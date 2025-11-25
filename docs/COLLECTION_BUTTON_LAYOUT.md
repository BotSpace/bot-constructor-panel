# Collection Button Layout Feature - PAGINATION

Collection ma'lumotlaridan tugmalar yaratishda **pagination** funksiyasini qo'shadi.

## Konsepsiya

Foydalanuvchi belgilaydi:
- **Columns**: Har bir qatorda nechta tugma (1-4)
- **Rows**: Har bir sahifada nechta qator (1-10)

**Hisoblash**: `columns × rows = bir sahifada tugmalar soni`

Misol: 3 ustun × 5 qator = **15 ta tugma** birinchi sahifada
- Agar collection da 50 ta element bo'lsa:
  - 1-sahifa: 1-15
  - 2-sahifa: 16-30
  - 3-sahifa: 31-45
  - 4-sahifa: 46-50

## Qo'shilgan Funksiyalar

### 1. Pagination Settings
- **Columns**: 1-4 ta ustun (tugmalar bilan tanlash)
- **Rows**: 1-10 ta qator (input orqali)
- **Hisoblash ko'rsatkichi**: "3 × 5 = 15 ta tugma"

### 2. Preview (O'ng Panelda)
- Tugma qo'shilgandan **keyin** ko'rinadi
- **Faqat bitta sahifa** ko'rsatiladi
- Real messageda qanday ko'rinishini ko'rsatadi
- Pagination navigation YO'Q (faqat preview)

### 3. Badge
- Collection tugmalar uchun: **3×5** (3 ustun, 5 qator)
- Database ikoni bilan

## Fayl O'zgarishlari

### O'zgartirilgan Fayllar
1. **types.ts**
   ```typescript
   layout: {
     columns: number,  // 1-4
     rows: number      // 1-10
   }
   ```

2. **InlineForm.tsx**
   - Pagination sozlamalari
   - Columns/Rows state
   - Hisoblash ko'rsatkichi

3. **ReplyForm.tsx**  
   - InlineForm bilan bir xil

4. **KeyboardPreview.tsx**
   - Preview collection buttons
   - Pagination navigation
   - O'ng panelda ko'rsatish

5. **PreviewButton.tsx**
   - Badge: columns×rows

6. **CollectionLayoutPreview.tsx**
   - Grid layout
   - Per-page calculation

## Ishlatish

### 1. Collection Tugma Yaratish

```typescript
// Foydalanuvchi tanlaydi:
columns: 3    // Har qatorda 3 ta
rows: 5       // Har sahifada 5 qator

// Natija:
{
  id: "btn-123",
  text: "📦 Categories",
  type: "callback",
  collectionData: {
    collection: "categories",
    field: "name",
    filters: [...],
    layout: {
      columns: 3,
      rows: 5
      // = 15 ta tugma birinchi sahifada
    }
  }
}
```

### 2. Preview (O'ng Panel)

Tugma qo'shilgandan keyin (faqat bitta sahifa preview):
```
┌─────────────────────────────┐
│ Preview: 📦 Categories      │
│ (bitta sahifa)              │
├─────────────────────────────┤
│ [Cat 1] [Cat 2] [Cat 3]     │
│ [Cat 4] [Cat 5] [Cat 6]     │
│ [Cat 7] [Cat 8] [Cat 9]     │
│ [Cat 10] [Cat 11] [Cat 12]  │
│ [Cat 13] [Cat 14] [Cat 15]  │
└─────────────────────────────┘
3 ustun × 5 qator = 15 ta
```

**Eslatma:** Preview faqat bitta sahifani ko'rsatadi, pagination navigation yo'q.

### 3. Badge

```
┌──────────────────┐
│ 📦 Categories 3×5│
└──────────────────┘
```

## Backend Integration

```python
def create_collection_buttons(collection_data):
    layout = collection_data.layout
    columns = layout.columns  # 3
    rows = layout.rows        # 5
    per_page = columns * rows # 15
    
    # Collection dan ma'lumotlar
    items = get_collection_items(
        collection_data.collection,
        collection_data.field,
        collection_data.filters
    )
    
    # Pagination
    total_pages = math.ceil(len(items) / per_page)
    current_page = context.get('page', 0)
    
    # Current page items
    start = current_page * per_page
    end = start + per_page
    page_items = items[start:end]
    
    # Grid yaratish
    buttons = []
    for i in range(0, len(page_items), columns):
        row = page_items[i:i+columns]
        buttons.append(row)
    
    # Navigation buttons qo'shish
    if total_pages > 1:
        nav_row = []
        if current_page > 0:
            nav_row.append({"text": "◀ Orqaga", "callback": f"prev_{current_page-1}"})
        nav_row.append({"text": f"{current_page+1}/{total_pages}", "callback": "noop"})
        if current_page < total_pages - 1:
            nav_row.append({"text": "Keyingi ▶", "callback": f"next_{current_page+1}"})
        buttons.append(nav_row)
    
    return buttons
```

## Misollar

### Misol 1: Kategoriyalar (2×3)
```
Sozlamalar: 2 ustun × 3 qator = 6 ta tugma

Sahifa 1:
[Elektronika] [Kiyim]
[Oziq-ovqat]  [Sport]
[Kitoblar]    [O'yinchoqlar]
[◀ 1/3 ▶]

Sahifa 2:
[Mebel]     [Avtomobil]
[Qurilish]  [Go'zallik]
[Salomatlik] [Boshqa]
[◀ 2/3 ▶]
```

### Misol 2: Mahsulotlar (3×5)
```
Sozlamalar: 3 ustun × 5 qator = 15 ta tugma

Sahifa 1:
[Mahsulot 1] [Mahsulot 2] [Mahsulot 3]
[Mahsulot 4] [Mahsulot 5] [Mahsulot 6]
...
[Mahsulot 13] [Mahsulot 14] [Mahsulot 15]
[◀ 1/5 ▶]
```

### Misol 3: List (1×10)
```
Sozlamalar: 1 ustun × 10 qator = 10 ta tugma

Sahifa 1:
[Element 1]
[Element 2]
[Element 3]
...
[Element 10]
[◀ 1/3 ▶]
```

## Xususiyatlar

✅ Sodda va tushunarli
✅ Real-time hisoblash
✅ Visual preview (bitta sahifa)
✅ Badge indicator
✅ TypeScript typed

## Testing

1. Collection tanlang
2. Field tanlang  
3. Pagination sozlang: 3×5
4. Qo'shing
5. O'ng panelda preview ko'ring (faqat bitta sahifa)
6. Badge ko'ring: 3×5

---

**Tayyor va ishlaydi!** 🎉
