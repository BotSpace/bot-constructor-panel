import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a unique ID */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Berilgan ob'ektni JSON fayl sifatida yuklab olish uchun brauzerda so'rov yaratadi.
 * @param data Yuklanadigan ma'lumotlar (JavaScript ob'ekti).
 * @param filename Fayl nomi (masalan, 'my-flow.json').
 */
export const downloadJson = (data: object, filename: string) => {
  // 1. Ma'lumotni chiroyli formatlangan JSON qatoriga o'tkazamiz (o'qish uchun qulay bo'ladi).
  const jsonString = JSON.stringify(data, null, 2);

  // 2. JSON qatoridan Blob (Binary Large Object) yaratamiz.
  const blob = new Blob([jsonString], { type: "application/json" });

  // 3. Blob uchun vaqtinchalik URL yaratamiz.
  const url = URL.createObjectURL(blob);

  // 4. Ko'rinmas <a> (havola) elementi yaratamiz.
  const link = document.createElement("a");
  link.href = url;
  link.download = filename; // Bu fayl nomini belgilaydi.

  // 5. Elementni DOM'ga qo'shib, avtomatik bosamiz va keyin o'chirib tashlaymiz.
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 6. Xotiradan tozalash uchun vaqtinchalik URL'ni bekor qilamiz.
  URL.revokeObjectURL(url);
};
