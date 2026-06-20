# Manifest tizimi — Umumiy ko'rinish

## Manifest nima va nega bor?

Bot Constructor panelida har bir node (trigger, action, custom logic, AI) avval **manifest** orqali e'lon qilinadi. Manifest — bu node haqida barcha ma'lumotni (ikon, rang, o'lcham, qaysi field'lar bo'lishi, qaysi handle'lar ulanganligi va h.k.) saqlaydigan JSON obyekti.

Eski yondashuv: har bir node uchun alohida React komponenti yozilar, unda hardcode field'lar, inline handle'lar, stil — hammasi takrorlanardi. Bu refactoring va qo'shish jarayonini qiyinlashtirardi.

Hozirgi yondashuv (manifest-driven): node'ni qo'shish uchun **faqat** `runtime-node-registry.json`'ga bitta JSON entry qo'shiladi. Barcha rendering — canvas'da ham, edit panelida ham — bitta `GenericNodeRenderer` va `ModalNodeFormRenderer` orqali avtomatik ishlaydi.

## To'liq oqim

```
runtime-node-registry.json
        |
        v
  manifestStore.ts       <-- JSON'ni yuklaydi, Map ga tushiradi
        |
        +---> index.ts   <-- genericNodeTypes yaratadi (har bir type uchun memo komponent)
                              validateNodeRegistryCoverage() chaqiradi
        |
        v
  createGenericNodeComponent(type)
        |
        v (React Flow node render)
  GenericNodeRenderer
     - resolveNodeIcon(manifest.iconName)       --> iconRegistry.tsx
     - NODE_COLOR_CLASS_REGISTRY[colorToken]    --> colorRegistry.ts
     - renderHandleFromManifest(handle, ...)    --> handlePresetRegistry.tsx
     - FieldWidget (canvas'da minimal preview) --> fieldWidgetRegistry.tsx
     - NodeHeader, HandlersList, ActionPanel

        v (tahrirlash uchun panel ochilganda)
  ModalNodeFormRenderer
     - isFieldVisible(data, field)              --> visibleWhen mantiq
     - optionalFieldConfigured()               --> optional/defaultVisible mantiq
     - ModalFieldWidget                        --> modal-field-widgets.tsx
       (ArrayEditorField, CodeEditorField, ConditionListField, CredentialSelectField, ...)
```

## Fayllar xaritasi

| Fayl | Maqsad |
|---|---|
| `manifest/types.ts` | Barcha TypeScript interfeyslari (NodeManifest, NodeFieldManifest, NodeHandleManifest, ...) |
| `manifest/runtime-node-registry.json` | Barcha node'larning JSON ta'riflari (6 000+ qator) |
| `manifest/manifestStore.ts` | JSON'ni yuklaydi, `getNodeManifestByType(type)` helper ni eksport qiladi |
| `manifest/index.ts` | `genericNodeTypes` map'ini yaratadi, coverage validatsiyasini ishga tushiradi |
| `manifest/fieldWidgetRegistry.tsx` | Canvas'da field type → React widget map (soddalashtirilgan) |
| `manifest/handlePresetRegistry.tsx` | Handle preset nomi → React Flow Handle komponenti |
| `manifest/iconRegistry.tsx` | `iconName` string → Lucide `ReactNode` yoki emoji string |
| `manifest/colorRegistry.ts` | `colorToken` → Tailwind class (node header uchun va sidebar uchun ikki xil) |
| `canvas/GenericNodeRenderer.tsx` | Canvas'dagi node karta UI'si (header + content + footer + handles) |
| `canvas/createGenericNodeComponent.tsx` | `type` bo'yicha manifest topib, `GenericNodeRenderer` ga uzatuvchi HOC |
| `panels/NodeEditPanel/ModalNodeFormRenderer.tsx` | Edit panelida barcha field'larni render qiladi (optional/required ajratish bilan) |
| `panels/NodeEditPanel/modal-field-widgets.tsx` | Paneldagi har bir field type uchun to'liq widget'lar |

## Asosiy qoidalar

- **Manifest > Renderer**: field ko'rinishini o'zgartirish kerak bo'lsa, `modal-field-widgets.tsx` yoki `GenericNodeRenderer`'ga tegmasdan, `runtime-node-registry.json`'da `type` qiymatini o'zgartir. Bu global regressiya xavfini oldini oladi.
- Registry JSON — bitta haqiqat manbai (single source of truth). Node'ni o'chirmoqchi bo'lsang — faqat JSONdagi entry'ni olib tashlash yetarli (avtomatik validatsiya xato beradi).
- Development mode'da `index.ts` ichida `validateNodeRegistryCoverage()` ishlaydi — `sidebar.enabled = true` bo'lgan node'lar uchun manifest mavjudligini tekshiradi.
