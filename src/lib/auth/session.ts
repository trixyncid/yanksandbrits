import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

export type CmsUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
};

// One session lookup per request, shared by the layout, the page, and actions.
export const getCurrentUser = cache(async (): Promise<CmsUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, name, email, role } = session.user;
  return { id, name, email, role: role === "admin" ? "admin" : "editor" };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/admin");
  return user;
}
