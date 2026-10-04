// Works out when each care item is next due, from the rules in care-rules.ts,
// and stores the due dates the user has changed by hand.

import { CARE_ITEMS, CARE_RULES, type CareItem, type Duration } from "./care-rules";
import type { Pet } from "./pets";
import type { CareRecord } from "./records";
import { readList, useStoredList, writeList } from "./storage";

// --- Date math on "YYYY-MM-DD" strings ---

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDuration(date: string, duration: Duration): string {
  const [year, month, day] = date.split("-").map(Number);
  if ("weeks" in duration) {
    return toDateString(new Date(year, month - 1, day + duration.weeks * 7));
  }
  const months = "months" in duration ? duration.months : duration.years * 12;
  // Jan 31 + 1 month should be Feb 28, not Mar 3, so cap the day.
  const lastDayOfMonth = new Date(year, month - 1 + months + 1, 0).getDate();
  return toDateString(new Date(year, month - 1 + months, Math.min(day, lastDayOfMonth)));
}

export function isOverdue(date: string): boolean {
  return date < toDateString(new Date());
}

// --- Suggested due dates ---

export function suggestedDueDate(
  item: CareItem,
  dateOfBirth: string,
  records: CareRecord[], // this cat's records
): string | null {
  const rule = CARE_RULES[item];
  const doses = records
    .filter((r) => r.type === item)
    .map((r) => r.date)
    .sort();

  if (doses.length === 0) return addDuration(dateOfBirth, rule.firstDue);

  // Walk through the doses in date order to find which step comes next.
  // The first dose is the "first due" one, so we start on step 0 of `then`.
  let step = 0;
  doses.forEach((dose, i) => {
    // Every dose after the first uses up a one-time step.
    // An "every" step stays put until the age check below ends it.
    if (i > 0 && rule.then[step] && rule.then[step].type !== "every") step++;

    // Skip steps the cat has aged past on the day of this dose.
    while (step < rule.then.length) {
      const s = rule.then[step];
      const endAge =
        s.type === "every" ? s.untilAge : s.type === "atAge" ? s.age : undefined;
      if (endAge && dose >= addDuration(dateOfBirth, endAge)) step++;
      else break;
    }
  });

  const next = rule.then[step];
  if (!next) return null; // rule finished, nothing more due
  const lastDose = doses[doses.length - 1];
  switch (next.type) {
    case "every":
      return addDuration(lastDose, next.interval);
    case "after":
      return addDuration(lastDose, next.wait);
    case "atAge":
      return addDuration(dateOfBirth, next.age);
  }
}

// --- Due dates the user changed by hand ---

type CustomDueDate = { petId: string; item: CareItem; date: string };

const CUSTOM_KEY = "customDueDates";

function isOtherEntry(e: CustomDueDate, petId: string, item: CareItem) {
  return e.petId !== petId || e.item !== item;
}

export function setCustomDueDate(petId: string, item: CareItem, date: string) {
  const others = readList<CustomDueDate>(CUSTOM_KEY).filter((e) => isOtherEntry(e, petId, item));
  writeList(CUSTOM_KEY, [...others, { petId, item, date }]);
}

export function clearCustomDueDate(petId: string, item: CareItem) {
  const list = readList<CustomDueDate>(CUSTOM_KEY);
  const others = list.filter((e) => isOtherEntry(e, petId, item));
  if (others.length !== list.length) writeList(CUSTOM_KEY, others);
}

export function useCustomDueDates(): CustomDueDate[] | null {
  return useStoredList<CustomDueDate>(CUSTOM_KEY);
}

// --- Putting it together ---

export type DueDate = {
  item: CareItem;
  date: string | null; // the date to show: custom if set, otherwise suggested
  isCustom: boolean;
};

export function getDueDates(
  pet: Pet,
  records: CareRecord[],
  customDueDates: CustomDueDate[],
): DueDate[] {
  const petRecords = records.filter((r) => r.petId === pet.id);
  return CARE_ITEMS.map((item) => {
    const custom = customDueDates.find((e) => e.petId === pet.id && e.item === item);
    return {
      item,
      date: custom ? custom.date : suggestedDueDate(item, pet.dateOfBirth, petRecords),
      isCustom: Boolean(custom),
    };
  });
}

export function soonestDueDate(dueDates: DueDate[]): DueDate | undefined {
  return dueDates
    .filter((d) => d.date !== null)
    .sort((a, b) => a.date!.localeCompare(b.date!))[0];
}
