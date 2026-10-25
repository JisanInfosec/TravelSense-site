"use client";

import { PageTitle } from "@/components/dashboard/side-nav";
import { PasswordForm, ProfileForm } from "@/components/dashboard/profile-forms";

export default function StaffProfilePage() {
  return (
    <>
      <PageTitle title="My profile" description="Update your staff account details and password." />
      <div className="space-y-6">
        <ProfileForm />
        <PasswordForm />
      </div>
    </>
  );
}
