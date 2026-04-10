export type RelationshipContext = "romantic" | "friend" | "work";

export type CompatibilityPreviewCard = {
  type: string;
  headline: string;
  body: string;
};

export type CompatibilityPreviewPayload = {
  title: string;
  summary: string;
  cards: CompatibilityPreviewCard[];
  locked: boolean;
};

export type CompatibilityPaywallPreview = {
  offer_key: string;
  price_local: number;
  currency: string;
};

export type CompatibilityPreviewResponse = {
  compatibility_request_id: string;
  preview: CompatibilityPreviewPayload;
  paywall: CompatibilityPaywallPreview;
};

export type TelegramInvoicePrice = {
  label: string;
  amount: number;
};

export type TelegramStarsInvoicePayload = {
  title: string;
  description: string;
  payload: string;
  currency: "XTR";
  prices: TelegramInvoicePrice[];
  start_parameter: string;
};

export type PremiumCheckoutSessionResponse = {
  checkout_session_id: string;
  status: "ready";
  provider: "telegram_stars";
  mode: "simulated";
  provider_configured: boolean;
  offer_key: string;
  invoice_slug: string | null;
  invoice_url: string | null;
  invoice: TelegramStarsInvoicePayload | null;
  stars_amount: number;
  deep_link: string | null;
};
