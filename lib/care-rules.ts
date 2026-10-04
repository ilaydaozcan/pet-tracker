// The care items from the care rules table in SPEC.md.
// The schedule for each one (first due, repeat, etc.) comes in feature 3b.

export const CARE_ITEMS = [
  "FVRCP vaccine",
  "Rabies vaccine",
  "FeLV vaccine",
  "Deworming",
  "Wellness check-up",
] as const;

export type CareItem = (typeof CARE_ITEMS)[number];
