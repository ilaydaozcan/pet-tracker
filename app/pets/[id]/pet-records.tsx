"use client";

import { useState } from "react";
import Link from "next/link";
import { CARE_ITEMS } from "@/lib/care-rules";
import { usePets } from "@/lib/pets";
import {
  addRecord,
  formatDate,
  useRecords,
  type CareRecord,
  type RecordType,
} from "@/lib/records";

const inputClass =
  "w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2";

export default function PetRecords({ petId }: { petId: string }) {
  const pets = usePets();
  const records = useRecords();

  // Not loaded from the browser yet (see usePets in lib/pets.ts).
  if (pets === null || records === null) return null;

  const pet = pets.find((p) => p.id === petId);
  if (!pet) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Cat not found</h1>
        <Link href="/" className="underline">Back to home</Link>
      </div>
    );
  }

  // Newest first. Records on the same date: the one logged last comes first.
  const petRecords = records
    .filter((r) => r.petId === petId)
    .reverse()
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <Link href="/" className="text-foreground/70 underline">← My cats</Link>
      <h1 className="mt-4 mb-6 text-2xl font-semibold">{pet.name}&apos;s records</h1>

      <RecordForm petId={petId} />

      <h2 className="mt-10 mb-4 text-lg font-semibold">Logged</h2>
      {petRecords.length === 0 ? (
        <p className="text-foreground/70">No records yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {petRecords.map((record) => (
            <RecordItem key={record.id} record={record} />
          ))}
        </ul>
      )}
    </>
  );
}

function RecordForm({ petId }: { petId: string }) {
  const [type, setType] = useState<RecordType | "">("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!type) return; // the browser's `required` already blocks this
    try {
      addRecord({ petId, type, date, notes: notes.trim() });
    } catch {
      setError("Couldn't save. The browser's storage may be full.");
      return;
    }
    setType("");
    setDate("");
    setNotes("");
    setError("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-lg border border-foreground/15 p-4"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="type" className="font-medium">Type</label>
        <select
          id="type"
          required
          value={type}
          onChange={(e) => setType(e.target.value as RecordType)}
          className={inputClass}
        >
          <option value="" disabled>Choose a care item</option>
          {CARE_ITEMS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="date" className="font-medium">Date</label>
        <input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className="font-medium">Notes</label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p role="alert" className="text-red-600">{error}</p>}

      <button
        type="submit"
        className="rounded-md bg-foreground px-4 py-2 font-medium text-background"
      >
        Log record
      </button>
    </form>
  );
}

function RecordItem({ record }: { record: CareRecord }) {
  return (
    <li className="rounded-lg border border-foreground/15 p-4">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-medium">{record.type}</span>
        <span className="text-foreground/70">{formatDate(record.date)}</span>
      </div>
      {record.notes && (
        <p className="mt-2 whitespace-pre-wrap text-foreground/80">{record.notes}</p>
      )}
    </li>
  );
}
