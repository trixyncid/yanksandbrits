import type { Metadata } from "next";
import { PageHeader, panel } from "@/components/admin/page-header";
import { RemoveUserButton } from "@/components/admin/remove-user-button";
import { ResetPasswordButton } from "@/components/admin/reset-password-button";
import { UserForm } from "@/components/admin/user-form";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/cms/format";
import { listUsers } from "@/lib/cms/users";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Users" };

// Per-user and behind sign-in: allowed to block (see the CMS layout).
export const instant = false;

export default async function UsersPage() {
  const actor = await requireAdmin();
  const users = await listUsers();

  return (
    <div className="max-w-[90rem]">
      <PageHeader eyebrow="Admin" title="Users" description="Public sign-up is off. Every account is created here or by the seed script." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className={cn(panel, "overflow-hidden")} aria-labelledby="team-heading">
          <h2 id="team-heading" className="border-b border-cms-field px-5 py-4 text-base font-semibold">
            Team · {users.length}
          </h2>
          <ul className="divide-y divide-cms-field">
            {users.map((user) => (
              <li key={user.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cms-blue-10 text-sm font-semibold text-cms-blue uppercase">
                  {user.name.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {user.name}
                    {user.id === actor.id ? <span className="ml-2 text-xs font-medium text-cms-ink/60">(you)</span> : null}
                  </span>
                  <span className="block truncate text-xs text-cms-ink/60">
                    {user.email} · {user._count.articles} articles · since {formatDate(user.createdAt)}
                  </span>
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                    user.role === "admin" ? "bg-cms-navy text-white" : "bg-cms-gray-25 text-cms-ink/60",
                  )}
                >
                  {user.role}
                </span>
                {/* Admins can reset editors' passwords; admins change their own under Account. */}
                {user.role === "editor" ? <ResetPasswordButton id={user.id} name={user.name} /> : <span className="size-8" aria-hidden="true" />}
                {user.id !== actor.id ? <RemoveUserButton id={user.id} name={user.name} /> : <span className="size-8" aria-hidden="true" />}
              </li>
            ))}
          </ul>
        </section>

        <section className={cn(panel, "h-fit p-5")} aria-labelledby="add-heading">
          <h2 id="add-heading" className="mb-4 text-base font-semibold">
            Add an account
          </h2>
          <UserForm />
        </section>
      </div>
    </div>
  );
}
