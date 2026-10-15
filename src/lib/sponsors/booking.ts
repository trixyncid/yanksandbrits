import { isSlotId, sponsorSlots } from "./slots";

export type Booking = { slug: string; slots: string[]; startsOn: string; endsOn: string };

/**
 * Finds the first slot this campaign would overbook. Overlap is checked on every day a booking
 * starts inside the new campaign's run, which is where the number of live campaigns can peak.
 */
export function findOverbooking(ad: Booking, others: Booking[]) {
  for (const slot of ad.slots.filter(isSlotId)) {
    const { limit } = sponsorSlots[slot];
    if (limit == null) continue;
    const rivals = others.filter((other) => other.slots.includes(slot) && other.startsOn <= ad.endsOn && ad.startsOn <= other.endsOn);
    const checkpoints = [ad.startsOn, ...rivals.map((other) => other.startsOn).filter((start) => start > ad.startsOn && start <= ad.endsOn)];
    for (const point of checkpoints) {
      const live = rivals.filter((other) => other.startsOn <= point && point <= other.endsOn);
      if (live.length + 1 > limit) return { slot, limit, conflicts: live.map((other) => other.slug), date: point };
    }
  }
  return null;
}
