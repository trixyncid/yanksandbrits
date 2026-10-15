import type { Metadata } from "next";
import { PageHeader, panel } from "@/components/admin/page-header";
import { PasswordForm } from "@/components/admin/password-form";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { requireUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Account" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Account" title={user.name} description={`${user.email} · ${user.role}`} />
      <div className="grid gap-6">
        <section className={cn(panel, "p-5")} aria-labelledby="password-heading">
          <h2 id="password-heading" className="mb-4 text-base font-semibold">
            Change password
          </h2>
          <PasswordForm />
        </section>
        <section className={cn(panel, "flex items-center justify-between gap-4 bg-cms-navy p-5 text-white")} aria-labelledby="signout-heading">
          <div>
            <h2 id="signout-heading" className="text-base font-semibold">
              Sign out
            </h2>
            <p className="text-sm text-cms-gray-50">End the session on this device.</p>
          </div>
          <SignOutButton />
        </section>
      </div>
    </div>
  );
}
