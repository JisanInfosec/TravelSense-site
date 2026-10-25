"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import type { AdminDestination } from "@/lib/types";
import { AdminOnly } from "@/components/admin/admin-only";
import { DestinationForm } from "@/components/admin/destination-form";
import { ErrorState, Spinner } from "@/components/ui/states";

export default function EditDestinationPage() {
  return (
    <AdminOnly>
      <Editor />
    </AdminOnly>
  );
}

function Editor() {
  const { id } = useParams<{ id: string }>();
  const { data, error, mutate } = useSWR<AdminDestination>(`/admin/destinations/${id}`);
  if (error) return <ErrorState message={error.message} onRetry={() => mutate()} />;
  if (!data) return <Spinner />;
  return <DestinationForm initial={data} key={data.updatedAt} />;
}
