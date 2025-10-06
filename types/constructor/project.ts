interface Bot {
  id: number;
  name: string;
}

export interface Project {
  id: number;
  name: string;
  bot_is_released: boolean;
  bot_is_debug: boolean;
  flow: number;
  bot_for_debug: Bot;
  bot_for_release: Bot;
}
