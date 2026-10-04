import type { Metadata } from "next";
import EditPet from "./edit-pet";

export const metadata: Metadata = {
  title: "Edit pet",
};

export default async function EditPetPage({ params }: PageProps<"/pets/[id]/edit">) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <EditPet petId={id} />
    </main>
  );
}
