// Murakkab context'lar uchun tiplar
interface RadiusContext {
  lat?: number | string;
  lng?: number | string;
  km?: number | string;
}

interface SizeContext {
  min?: number | string;
  max?: number | string;
}

// Bizning node saqlaydigan asosiy ma'lumotlar strukturasi
export interface MessageTriggerNodeData {
  // Bu maydonlar ixtiyoriy (`?`), chunki node dastlab bo'sh bo'lishi mumkin
  type?: string; // 'text', 'location', 'document'
  filter?: string; // 'contains', 'regex', 'radius'
  context?: {
    value?: string; // Umumiy qiymat uchun (matn, command, extension)
    radius?: RadiusContext;
    size?: SizeContext;
  };
}
