// Universal, ko'p ishlatiladigan filtrlar
const anyFilter = [{ value: "any", label: "Har qanday" }];

// Matnli ma'lumotlar uchun filtrlar
export const textFilters = [
  ...anyFilter, // "Har qanday"ni qo'shamiz
  { value: "equals", label: "Teng" },
  { value: "contains", label: "Ichida" },
  { value: "starts_with", label: "Boshlanadi" },
  { value: "regex", label: "Regex" },
  { value: "command", label: "Buyruq" },
];

// Callback Query uchun maxsus filtrlar
export const callbackFilters = [
  ...anyFilter, // "Har qanday"ni qo'shamiz
  { value: "equals", label: "Teng (Static)" },
  { value: "collection", label: "Collection (Dynamic)" },
  { value: "contains", label: "Ichida" },
  { value: "starts_with", label: "Boshlanadi" },
  { value: "regex", label: "Regex" },
];

// Joylashuv uchun filtrlar
export const locationFilters = [
  ...anyFilter,
  { value: "radius", label: "Radius (ichida)" },
];

// Fayllar (rasm, video, audio, hujjat) uchun filtrlar
export const fileFilters = [
  ...anyFilter,
  { value: "size", label: "Hajm (MB)" },
];

// Hujjatlar uchun maxsus qo'shimcha filtr
export const documentFilters = [
  ...fileFilters,
  { value: "extension", label: "Kengaytmasi" },
];

// Barcha filtrlar to'plami
export const Filters = {
  textFilters,
  callbackFilters,
  locationFilters,
  fileFilters,
  documentFilters,
  anyFilter, // Faqat "Har qanday" kerak bo'lganda ishlatish uchun
};
