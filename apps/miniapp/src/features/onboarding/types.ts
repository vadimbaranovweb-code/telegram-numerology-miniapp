import { ReadingPreview } from "@/features/reading/types";

export type PersonalityScores = {
  leadership: number;
  intuition: number;
  creativity: number;
  logic: number;
  empathy: number;
};

export type PinnacleInfo = {
  number: number;
  start_age: number;
  end_age: number | null;
  is_current: boolean;
};

export type AiInsights = {
  life_path_headline: string;
  life_path_body: string;
  year_energy_body: string;
  personality_summary: string;
  strength_headline: string;
  strength_body: string;
  shadow_headline: string;
  shadow_body: string;
  pinnacle_body: string;
  karmic_body: string;
};

export type NumerologyResponse = {
  birth_date: string;
  life_path_number: number;
  destiny_number: number | null;
  soul_urge_number: number | null;
  personal_year_number: number;
  personal_month_number: number;
  calculation_system: string;
  calculation_version: string;
  reading_preview: ReadingPreview;
  personality_scores: PersonalityScores | null;
  pinnacles: PinnacleInfo[];
  karmic_lessons: number[];
  pythagorean_matrix: Record<string, number> | null;
  ai_insights: AiInsights | null;
};
