// Murakkab context'lar uchun tiplar
interface RadiusContext {
  lat?: string; // Faqat string
  lng?: string;
  km?: string;
}

interface SizeContext {
  min?: string; // Faqat string
  max?: string;
}

// Bizning node saqlaydigan asosiy ma'lumotlar strukturasi
export interface MessageTriggerNodeData {
  type?: string;
  filter?: string;
  context?: {
    value?: string;
    radius?: RadiusContext;
    size?: SizeContext;
  };
}
