// Telegram API dagi KeyboardButton obyekti
export interface TelegramKeyboardButton {
  text: string;
  request_contact?: boolean;
  request_location?: boolean;
  // Boshqa xususiyatlar ham qo'shilishi mumkin
}

// Ilovamiz ichida ishlatiladigan tugma tipi (drag-n-drop uchun unikal ID bilan)
export interface AppButton extends TelegramKeyboardButton {
  id: string;
}
