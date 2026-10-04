// Everything about how pets are stored lives in this one file,
// so the rest of the app never touches storage directly.

import { clearCustomDueDatesForPet } from "./due-dates";
import { deleteRecordsForPet } from "./records";
import { readList, useStoredList, writeList } from "./storage";

export type Pet = {
  id: string;
  name: string;
  breed: string;
  dateOfBirth: string; // "YYYY-MM-DD", the format <input type="date"> gives us
  photo: string; // the image itself, encoded as a data URL
};

const STORAGE_KEY = "pets";

export function getPets(): Pet[] {
  return readList<Pet>(STORAGE_KEY);
}

export function addPet(pet: Omit<Pet, "id">): Pet {
  const newPet: Pet = { ...pet, id: crypto.randomUUID() };
  writeList(STORAGE_KEY, [...getPets(), newPet]);
  return newPet;
}

export function updatePet(pet: Pet) {
  writeList(STORAGE_KEY, getPets().map((p) => (p.id === pet.id ? pet : p)));
}

// Removes the pet and everything saved about them.
export function deletePet(petId: string) {
  writeList(STORAGE_KEY, getPets().filter((p) => p.id !== petId));
  deleteRecordsForPet(petId);
  clearCustomDueDatesForPet(petId);
}

// localStorage only holds about 5MB in total, and a phone photo can be
// bigger than that on its own. So we shrink the photo before saving it.
export function resizePhoto(file: File, maxSize = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image"));
    };
    img.src = url;
  });
}

export function usePets(): Pet[] | null {
  return useStoredList<Pet>(STORAGE_KEY);
}

// --- Age ---

// "2024-05-10" -> "1 year, 4 months". Kittens change fast, so young
// cats are shown in weeks, then months, then years.
export function formatAge(dateOfBirth: string, today = new Date()): string {
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const birth = new Date(year, month - 1, day);

  const days = Math.floor((today.getTime() - birth.getTime()) / 86_400_000);
  if (days < 0) return "Not born yet";

  let months = (today.getFullYear() - year) * 12 + (today.getMonth() - (month - 1));
  if (today.getDate() < day) months--;

  if (months < 2) {
    const weeks = Math.floor(days / 7);
    return weeks < 1 ? plural(days, "day") : plural(weeks, "week");
  }
  if (months < 12) return plural(months, "month");

  const years = Math.floor(months / 12);
  const extraMonths = months % 12;
  return extraMonths
    ? `${plural(years, "year")}, ${plural(extraMonths, "month")}`
    : plural(years, "year");
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
