import { Config } from "driver.js";

export const tourConfig: Config = {
  showProgress: true,
  progressText: '{{current}} dan {{total}}',
  nextBtnText: 'Keyingisi',
  prevBtnText: 'Orqaga',
  doneBtnText: 'Tushunarli',
  steps: [
    {
      element: '#sidebar-triggers', // Sidebar'dagi Triggers qismi uchun
      popover: {
        title: 'Triggerlar (Triggers)',
        description: 'Bot ishga tushishi uchun sabab boʻladigan hodisalar. Masalan, xabar kelishi yoki tugma bosilishi.',
        side: "right",
        align: 'start'
      }
    },
    {
      element: '#sidebar-actions', // Sidebar'dagi Actions qismi uchun
      popover: {
        title: 'Amallar (Actions)',
        description: 'Bot foydalanuvchiga nima javob qaytarishini shu yerdan tanlaysiz: Matn, Rasm, Video va boshqalar.',
        side: "right",
        align: 'start'
      }
    },
    {
      element: '.search-components-input', // Qidiruv inputi uchun
      popover: {
        title: 'Tezkor qidiruv',
        description: 'Kerakli blokni (component) tezda topish uchun qidiruvdan foydalaning.',
        side: "bottom",
        align: 'start'
      }
    },
    {
      element: '#canvas-area', // Markaziy qora maydon
      popover: {
        title: 'Ish maydoni (Canvas)',
        description: 'Bloklarni shu yerga sudrab oʻtkazing (drag & drop) va ularni bir-biri bilan bogʻlab bot mantiqini yarating.',
        side: "bottom",
        align: 'center'
      }
    },
    {
      element: '#save-status', // Yuqori o'ngdagi "Saved" yozuvi
      popover: {
        title: 'Avtomatik saqlash',
        description: 'Xavotir olmang, har bir oʻzgarish avtomatik tarzda saqlanib boradi.',
        side: "bottom",
        align: 'end'
      }
    },
    {
      element: '#open-bot-btn', // "Open bot" tugmasi
      popover: {
        title: 'Botni sinab koʻrish',
        description: 'Yaratgan mantiqingiz qanday ishlayotganini Telegram orqali real vaqtda tekshirib koʻring.',
        side: "bottom",
        align: 'end'
      }
    },
    {
      element: '#version-switcher', // "Version 3" tugmasi
      popover: {
        title: 'Versiyalar nazorati',
        description: 'Botning eski versiyalariga qaytish yoki yangi versiyalar yaratish imkoniyati.',
        side: "bottom",
        align: 'end'
      }
    }
  ]
};
