const HISTORY_KEY = "numerology-calc-history-v1";
const MAX_ENTRIES = 50;

export type CalculationType = "numerology" | "compatibility" | "horoscope";

export type CalculationHistoryEntry = {
  id: string;
  type: CalculationType;
  birthDate: string;
  displayName: string | null;
  /** For compatibility — the target person's name */
  targetName?: string;
  lifePathNumber?: number;
  createdAt: string; // ISO timestamp
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
