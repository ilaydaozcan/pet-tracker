"use client";

import Image from "next/image";
import Link from "next/link";
import { formatAge, usePets, type Pet } from "@/lib/pets";

const buttonClass =
  "rounded-md bg-foreground px-4 py-2 font-medium text-background";

export default function PetList() {
  const pets = usePets();

  // null = still on the server / before the browser has read localStorage.
  // Rendering nothing here avoids flashing "no cats" before the real list.
  if (pets === null) return null;

  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">No cats yet</h1>
        <p className="text-foreground/70">Add your first cat to get started.</p>
        <Link href="/add-pet" className={buttonClass}>
          Add a cat
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My cats</h1>
        <Link href="/add-pet" className={buttonClass}>
          Add a cat
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </ul>
    </>
  );
}

function PetCard({ pet }: { pet: Pet }) {
  return (
    <li className="flex flex-col gap-4 rounded-lg border border-foreground/15 p-4">
      <div className="flex items-center gap-4">
        <Image
          src={pet.photo}
          alt={pet.name}
          width={80}
          height={80}
          unoptimized
          className="h-20 w-20 rounded-full object-cover"
        />
        <div>
          <h2 className="text-lg font-semibold">{pet.name}</h2>
          <p className="text-foreground/70">{pet.breed}</p>
          <p className="text-foreground/70">{formatAge(pet.dateOfBirth)}</p>
        </div>
      </div>

      {/* Later feature: what's due next */}

      <div className="flex gap-4">
        <Link href={`/pets/${pet.id}`} className="underline">
          View records
        </Link>
        {/* Later feature: edit profile link */}
      </div>
    </li>
  );
}
