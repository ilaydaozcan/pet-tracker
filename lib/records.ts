// Everything about how care records are stored lives in this one file.

import type { CareItem } from "./care-rules";
import { readList, useStoredList, writeList } from "./storage";

export type RecordType = CareItem | "Other";

export type CareRecord = {
  id: string;
  petId: string; // which cat this record belongs to
  type: RecordType;
  date: string; // "YYYY-MM-DD"
  notes: string;
};

const STORAGE_KEY = "records";

export function addRecord(record: Omit<CareRecord, "id">): CareRecord {
  const newRecord: CareRecord = { ...record, id: crypto.randomUUID() };
  writeList(STORAGE_KEY, [...readList<CareRecord>(STORAGE_KEY), newRecord]);
  return newRecord;
}

export function useRecords(): CareRecord[] | null {
  return useStoredList<CareRecord>(STORAGE_KEY);
}

// "2026-10-03" -> "Oct 3, 2026"
export function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
