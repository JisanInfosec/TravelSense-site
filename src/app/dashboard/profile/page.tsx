"use client";

import { PageTitle } from "@/components/dashboard/side-nav";
import { PasswordForm, ProfileForm } from "@/components/dashboard/profile-forms";

export default function ProfilePage() {
  return (
    <>
      <PageTitle title="Edit profile" description="Update your personal details and password." />
      <div className="space-y-6">
        <ProfileForm />
        <PasswordForm />
      </div>
    </>
  );
}
