import { ReadingPreview } from "@/features/reading/types";

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
};
