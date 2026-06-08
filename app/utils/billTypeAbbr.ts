const ABBR: Record<string, string> = {
  HJRES: "HJR",
  HCONRES: "HCR",
  HRES: "HRS",
  SJRES: "SJR",
  SCONRES: "SCR",
  SRES: "SRS",
};

export function abbrevBillType(type: string): string {
  const upper = type.toUpperCase();
  return ABBR[upper] ?? upper;
}

// All lowercase aliases (abbreviations + natural language) for each bill type.
// The full type codes (hjres, hconres, etc.) are already handled by the
// existing billIdFlat prefix-match logic in SearchModal.
export const BILL_TYPE_SEARCH_ALIASES: Record<string, string[]> = {
  HJRES: ["hjr", "house joint resolution"],
  HCONRES: ["hcr", "house concurrent resolution"],
  HRES: ["hrs", "house resolution", "house simple resolution"],
  SJRES: ["sjr", "senate joint resolution"],
  SCONRES: ["scr", "senate concurrent resolution"],
  SRES: ["srs", "senate resolution", "senate simple resolution"],
  HR: ["house bill", "house resolution bill"],
  S: ["senate bill"],
}
