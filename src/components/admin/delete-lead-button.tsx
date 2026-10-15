"use client";

import { deleteLeadAction } from "@/actions/cms";
import { DeleteButton } from "./form-parts";

export function DeleteLeadButton({ id, name }: { id: string; name: string }) {
  return (
    <DeleteButton
      label="Delete lead"
      title={`Delete ${name}?`}
      description="This removes their name, number, and answers from the CMS for good. Use it when someone asks for their data to be erased. Copies already exported to Excel are not affected."
      onConfirm={() => deleteLeadAction(id)}
    />
  );
}
