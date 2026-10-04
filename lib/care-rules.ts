// The care rules table from SPEC.md, kept as plain data so the numbers
// can be edited here without touching any other code.

export const CARE_ITEMS = [
  "FVRCP vaccine",
  "Rabies vaccine",
  "FeLV vaccine",
  "Deworming",
  "Wellness check-up",
] as const;

export type CareItem = (typeof CARE_ITEMS)[number];

export type Duration = { weeks: number } | { months: number } | { years: number };

// What happens after each dose, in order. A rule moves to its next step
// once the current one is done.
export type Step =
  // Repeat every `interval`. With `untilAge`, the step ends once a dose
  // is given at or after that age; without it, it repeats forever.
  | { type: "every"; interval: Duration; untilAge?: Duration }
  // One dose, `wait` after the previous dose.
  | { type: "after"; wait: Duration }
  // One dose, when the cat reaches `age`.
  | { type: "atAge"; age: Duration };

export type CareRule = {
  firstDue: Duration; // age of the first dose
  then: Step[]; // after the last step, nothing more is due
};

export const CARE_RULES: Record<CareItem, CareRule> = {
  "FVRCP vaccine": {
    firstDue: { weeks: 8 },
    then: [
      { type: "every", interval: { weeks: 3 }, untilAge: { weeks: 16 } },
      { type: "atAge", age: { months: 6 } },
      { type: "every", interval: { years: 3 } },
    ],
  },
  "Rabies vaccine": {
    firstDue: { weeks: 12 },
    then: [
      { type: "after", wait: { years: 1 } },
      { type: "every", interval: { years: 3 } },
    ],
  },
  "FeLV vaccine": {
    firstDue: { weeks: 8 },
    then: [
      { type: "after", wait: { weeks: 3 } },
      { type: "after", wait: { years: 1 } },
      { type: "every", interval: { years: 2 } },
    ],
  },
  Deworming: {
    firstDue: { weeks: 3 },
    then: [
      { type: "every", interval: { weeks: 2 }, untilAge: { weeks: 9 } },
      { type: "every", interval: { months: 1 }, untilAge: { months: 6 } },
    ],
  },
  "Wellness check-up": {
    firstDue: { years: 1 },
    then: [{ type: "every", interval: { years: 1 } }],
  },
};
