"use client";

import { AdminOnly } from "@/components/admin/admin-only";
import { DestinationForm } from "@/components/admin/destination-form";

export default function NewDestinationPage() {
  return (
    <AdminOnly>
      <DestinationForm />
    </AdminOnly>
  );
}
