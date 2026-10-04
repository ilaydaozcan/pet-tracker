import type { Metadata } from "next";
import PetRecords from "./pet-records";

export const metadata: Metadata = {
  title: "Records",
};

// [id] in the folder name means this one file serves every cat:
// /pets/abc123 gives params = { id: "abc123" }.
export default async function PetRecordsPage({ params }: PageProps<"/pets/[id]">) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <PetRecords petId={id} />
    </main>
  );
}
