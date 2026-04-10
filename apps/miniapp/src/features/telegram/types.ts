export type TelegramWebAppUser = {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

export type TelegramWebAppContext = {
  isAvailable: boolean;
  initData: string | null;
  colorScheme: string | null;
  platform: string | null;
  version: string | null;
  canOpenInvoice: boolean;
  user: TelegramWebAppUser | null;
};
