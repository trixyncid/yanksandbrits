import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { CmsUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { adInputSchema, type AdInput, type AdValues } from "@/lib/sponsors/schema";
import { findOverbooking } from "@/lib/sponsors/booking";
import { sponsorSlots } from "@/lib/sponsors/slots";
import { fieldErrors } from "./validation";

export type AdState = "live" | "scheduled" | "ended" | "paused";

const day = (date: Date) => date.toISOString().slice(0, 10);

/** Today's date in Medan (WIB), the timezone campaign dates are agreed in. */
export function todayWib(now = new Date()) {
  return new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function adState(ad: { active: boolean; startsOn: Date; endsOn: Date }, today = todayWib()): AdState {
  if (!ad.active) return "paused";
  if (day(ad.endsOn) < today) return "ended";
  if (day(ad.startsOn) > today) return "scheduled";
  return "live";
}

export async function listAds() {
  return db.ad.findMany({ orderBy: [{ active: "desc" }, { endsOn: "desc" }] });
}

export const getAdForEdit = (id: string) => db.ad.findUnique({ where: { id } });

export type AdSaveResult = { ok: true; id: string; updatedAt: string } | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function saveAd(raw: AdInput): Promise<AdSaveResult> {
  const parsed = adInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) };
  const { id, ...input } = parsed.data;

  const clash = await db.ad.findFirst({ where: { slug: input.slug, ...(id ? { NOT: { id } } : {}) }, select: { id: true } });
  if (clash) return { ok: false, message: "Another campaign already uses this id.", fieldErrors: { slug: "Campaign id is taken" } };

  if (input.active) {
    const others = await db.ad.findMany({
      where: { active: true, slots: { hasSome: input.slots }, ...(id ? { NOT: { id } } : {}) },
      select: { slug: true, slots: true, startsOn: true, endsOn: true },
    });
    const conflict = findOverbooking(input, others.map((other) => ({ ...other, startsOn: day(other.startsOn), endsOn: day(other.endsOn) })));
    if (conflict) {
      const { label } = sponsorSlots[conflict.slot];
      return {
        ok: false,
        message: `${label} holds ${conflict.limit} campaigns at a time. On ${conflict.date} it is already booked by ${conflict.conflicts.join(", ")}. Change the dates or pause one of them.`,
        fieldErrors: { slots: "Overbooked for these dates" },
      };
    }
  }

  const data = toData(input);
  if (id) {
    if (!(await db.ad.findUnique({ where: { id }, select: { id: true } }))) return { ok: false, message: "This campaign no longer exists." };
    const saved = await db.ad.update({ where: { id }, data, select: { id: true, updatedAt: true } });
    return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString() };
  }
  const saved = await db.ad.create({ data, select: { id: true, updatedAt: true } });
  return { ok: true, id: saved.id, updatedAt: saved.updatedAt.toISOString() };
}

function toData(input: Omit<AdValues, "id">) {
  const university = input.kind === "university";
  return {
    ...input,
    country: university ? input.country || null : null,
    city: university ? input.city || null : null,
    majors: university ? input.majors : [],
    // Program targeting went with the program-page placement.
    programs: [],
    startsOn: new Date(`${input.startsOn}T00:00:00Z`),
    endsOn: new Date(`${input.endsOn}T00:00:00Z`),
    copy: input.copy as Prisma.InputJsonValue,
  };
}

export async function deleteAd(user: CmsUser, id: string) {
  if (user.role !== "admin") return { ok: false as const, message: "Only an admin can delete a campaign. Pause it instead." };
  const deleted = await db.ad.deleteMany({ where: { id } });
  return deleted.count ? { ok: true as const } : { ok: false as const, message: "This campaign no longer exists." };
}
