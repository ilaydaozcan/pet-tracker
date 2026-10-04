"use client";

import { useState } from "react";
import Image from "next/image";
import { addPet, resizePhoto } from "@/lib/pets";

const inputClass =
  "w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2";

export default function AddPetForm() {
  const [photo, setPhoto] = useState("");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [savedName, setSavedName] = useState("");

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await resizePhoto(file));
      setError("");
    } catch {
      setError("That file couldn't be read as an image. Try another photo.");
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // stop the browser from reloading the page
    if (!photo) {
      setError("Please add a photo.");
      return;
    }
    try {
      addPet({ photo, name: name.trim(), breed: breed.trim(), dateOfBirth });
    } catch {
      setError("Couldn't save. The browser's storage may be full.");
      return;
    }
    setSavedName(name.trim());
    setPhoto("");
    setName("");
    setBreed("");
    setDateOfBirth("");
    setError("");
  }

  if (savedName) {
    return (
      <div role="status" className="rounded-md border border-green-600/40 bg-green-600/10 p-4">
        <p className="font-medium">{savedName} has been added!</p>
        <button
          type="button"
          onClick={() => setSavedName("")}
          className="mt-3 underline"
        >
          Add another cat
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="photo" className="font-medium">Photo</label>
        {photo && (
          <Image
            src={photo}
            alt="Preview of your cat"
            width={128}
            height={128}
            unoptimized
            className="h-32 w-32 rounded-full object-cover"
          />
        )}
        <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="font-medium">Name</label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="breed" className="font-medium">Breed</label>
        <input
          id="breed"
          required
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="dob" className="font-medium">Date of birth</label>
        <input
          id="dob"
          type="date"
          required
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p role="alert" className="text-red-600">{error}</p>}

      <button
        type="submit"
        className="rounded-md bg-foreground px-4 py-2 font-medium text-background"
      >
        Save cat
      </button>
    </form>
  );
}
