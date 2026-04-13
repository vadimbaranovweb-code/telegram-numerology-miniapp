export type ZodiacSign =
  | "aries" | "taurus" | "gemini" | "cancer" | "leo" | "virgo"
  | "libra" | "scorpio" | "sagittarius" | "capricorn" | "aquarius" | "pisces";

export type Element = "fire" | "earth" | "air" | "water";

export type ZodiacCard = {
  label: string;
  headline: string;
  body: string;
};

export type ZodiacInfo = {
  sign: ZodiacSign;
  sign_ru: string;
  symbol: string;
  element: Element;
  element_ru: string;
  ruling_planet: string;
  date_range: string;
  description: string;
};

export type DailyForecast = {
  headline: string;
  body: string;
  lucky_number: number;
  focus_area: string;
};

export type PersonalReading = {
  rising_sign: ZodiacSign;
  rising_sign_ru: string;
  moon_sign: ZodiacSign;
  moon_sign_ru: string;
  strengths: string[];
  weaknesses: string[];
  element_summary: string;
  summary: string;
};

export type ZodiacCompatibility = {
  source_sign: ZodiacSign;
  source_sign_ru: string;
  target_sign: ZodiacSign;
  target_sign_ru: string;
  score: number;
  headline: string;
  body: string;
  strengths: string[];
  challenges: string[];
};

export type HoroscopeAiInsights = {
  personal_body: string;
  daily_extended: string;
  life_guidance: string;
};

export type HoroscopeCompatAiInsights = {
  compatibility_body: string;
  advice: string;
};

export type HoroscopeReadingResponse = {
  birth_date: string;
  zodiac: ZodiacInfo;
  daily_forecast: DailyForecast;
  personal_reading: PersonalReading;
  cards: ZodiacCard[];
  ai_insights: HoroscopeAiInsights | null;
};

export type HoroscopeCompatibilityResponse = {
  source_zodiac: ZodiacInfo;
  target_zodiac: ZodiacInfo;
  compatibility: ZodiacCompatibility;
  cards: ZodiacCard[];
  ai_insights: HoroscopeCompatAiInsights | null;
};
