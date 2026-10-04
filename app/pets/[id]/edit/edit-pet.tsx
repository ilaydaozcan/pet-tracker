"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddPetForm from "@/app/add-pet/add-pet-form";
import { deletePet, usePets, type Pet } from "@/lib/pets";

export default function EditPet({ petId }: { petId: string }) {
  const pets = usePets();
  // Set once the pet is deleted, so the page shows nothing while we
  // leave, instead of flashing "Cat not found".
  const [deleted, setDeleted] = useState(false);

  // Not loaded from the browser yet (see usePets in lib/pets.ts).
  if (pets === null) return null;

  const pet = pets.find((p) => p.id === petId);
  if (!pet) {
    if (deleted) return null;
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Cat not found</h1>
        <Link href="/" className="underline">Back to home</Link>
      </div>
    );
  }

  return (
    <>
      <Link href={`/pets/${pet.id}`} className="text-foreground/70 underline">
        ← {pet.name}&apos;s records
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-semibold">Edit {pet.name}</h1>
      <AddPetForm pet={pet} />
      <DeletePet pet={pet} onDeleted={() => setDeleted(true)} />
    </>
  );
}

function DeletePet({ pet, onDeleted }: { pet: Pet; onDeleted: () => void }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    onDeleted();
    deletePet(pet.id);
    router.push("/");
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-10 text-red-600 underline"
      >
        Delete pet
      </button>
    );
  }

  return (
    <div role="alert" className="mt-10 flex flex-col gap-3">
      <p>Delete {pet.name} and all their records? This can&apos;t be undone.</p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-md bg-red-600 px-4 py-2 font-medium text-white"
        >
          Delete
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="underline">
          Cancel
        </button>
      </div>
    </div>
  );
}
