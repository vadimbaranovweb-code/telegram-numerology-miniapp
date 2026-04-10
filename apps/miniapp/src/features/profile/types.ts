import { NumerologyResponse } from "@/features/onboarding/types";

export type AppProfile = {
  display_name: string | null;
  birth_date: string;
  daily_opt_in: boolean;
  onboarding_completed: boolean;
};

export type ProfilePreviewResponse = AppProfile & {
  storage_mode: string;
};

export type TemporaryProfile = AppProfile;

export type AppSnapshot = {
  profile: TemporaryProfile;
  numerology: NumerologyResponse;
};
