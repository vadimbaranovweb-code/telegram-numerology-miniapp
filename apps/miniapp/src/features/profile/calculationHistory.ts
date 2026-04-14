import type { NumerologyResponse } from "@/features/onboarding/types";
import type { CompatibilityPreviewResponse } from "@/features/compatibility/types";
import type {
  HoroscopeReadingResponse,
  HoroscopeCompatibilityResponse,
} from "@/features/horoscope/types";

const HISTORY_KEY = "numerology-calc-history-v1";
const MAX_ENTRIES = 50;

export type CalculationType = "numerology" | "compatibility" | "horoscope";

export type CalculationHistoryPayload =
  | { kind: "numerology"; numerology: NumerologyResponse }
  | {
      kind: "compatibility";
      compatibility: CompatibilityPreviewResponse;
      sourceBirthDate: string;
      targetBirthDate: string;
      targetDisplayName?: string | null;
      relationshipContext?: string | null;
    }
  | { kind: "horoscope_reading"; horoscope: HoroscopeReadingResponse }
  | {
      kind: "horoscope_compat";
      horoscope: HoroscopeCompatibilityResponse;
      sourceBirthDate: string;
      targetBirthDate: string;
      targetDisplayName?: string | null;
    };

export type CalculationHistoryEntry = {
  id: string;
  type: CalculationType;
  birthDate: string;
  displayName: string | null;
  /** For compatibility — the target person's name */
  targetName?: string;
  lifePathNumber?: number;
  createdAt: string; // ISO timestamp
  /** Full result payload, available for entries created after 2026-04-14. */
  payload?: CalculationHistoryPayload;
};

export function getCalculationHistory(): CalculationHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CalculationHistoryEntry[];
  } catch {
    return [];
  }
}

export function addCalculationEntry(
  entry: Omit<CalculationHistoryEntry, "id" | "createdAt">,
): CalculationHistoryEntry {
  const history = getCalculationHistory();
  const newEntry: CalculationHistoryEntry = {
    ...entry,
    id: `calc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newEntry, ...history].slice(0, MAX_ENTRIES);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return newEntry;
}
