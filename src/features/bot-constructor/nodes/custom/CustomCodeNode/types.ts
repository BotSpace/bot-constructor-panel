export interface CustomCodeNodeData {
  label: string;
  code: string;
  language: "javascript";
  // Kelajakda kerak bo'lishi mumkin bo'lgan o'zgaruvchilar ro'yxati
  globals?: string[];
}
