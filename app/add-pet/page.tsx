import type { Metadata } from "next";
import AddPetForm from "./add-pet-form";

export const metadata: Metadata = {
  title: "Add pet",
};

export default function AddPetPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Add a cat</h1>
      <AddPetForm />
    </main>
  );
}
