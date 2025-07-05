import { ConstructorData } from "@/constructor/data";

/**
 * Berilgan xabar turiga mos keladigan filtrlar ro'yxatini qaytaradi.
 * Bu funksiya markazlashtirilgan bo'lib, o'zgartirishni osonlashtiradi.
 * @param type - Xabar turi (masalan, 'text', 'location', 'document')
 * @returns Filter obyektlaridan iborat massiv.
 */
export const getFiltersForType = (type?: string) => {
  if (!type) {
    return [];
  }

  switch (type) {
    // === Matnli turlar ===
    case "text":
    case "phone": // Telefon raqami ham matn hisoblanadi
      return ConstructorData.Filters.textFilters;

    case "contact":
      // Kontaktda ismi, familiyasi, telefon raqami bo'ladi (barchasi matn)
      return ConstructorData.Filters.textFilters;

    // === Joylashuv turi ===
    case "location":
      return ConstructorData.Filters.locationFilters;

    // === Fayl turlari ===
    case "photo":
    case "video":
    case "audio":
      // Bu fayllarda faqat "hajm" bo'yicha filtrlash mantiqan to'g'ri
      return ConstructorData.Filters.fileFilters;

    case "document":
      // Hujjatda "hajm" va "kengaytma" bo'yicha filtrlash mumkin
      return ConstructorData.Filters.documentFilters;

    // === Maxsus turlar (filtrlar kam yoki yo'q) ===
    case "sticker":
      // Stiker uchun maxsus filtrlar yo'q. Faqat "har qanday stiker" bo'lishi mumkin.
      return ConstructorData.Filters.anyFilter;

    // === "Har qanday" turi ===
    case "any": // <-- YANGI
    case "any_text":
      return []; // Bu turlar uchun filtr yo'q.

    // === Qolgan barcha holatlar ===
    default:
      // Agar noma'lum tur kelsa yoki filtr talab etilmaydigan tur bo'lsa
      return [];
  }
};
