import axios from "axios";

export function getBotInfo<T>(params: { token: string }) {
  return axios.get<T>(`https://api.telegram.org/bot${params.token}/getMe`);
}
