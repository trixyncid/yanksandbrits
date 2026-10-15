"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { deleteArticle as removeArticle, saveArticle as storeArticle, type SaveResult } from "@/lib/cms/articles";
import { createUser as addUser, removeUser as dropUser, resetUserPassword } from "@/lib/cms/users";
import {
  deleteProgram as removeProgram,
  moveProgram as reorderProgram,
  saveProgram as storeProgram,
  type ProgramSaveResult,
} from "@/lib/cms/programs";
import type { ArticleInput, ProgramInput } from "@/lib/cms/validation";
import { programsTag } from "@/lib/programs";
import { deleteAd as removeAd, saveAd as storeAd, type AdSaveResult } from "@/lib/cms/ads";
import {
  deletePerson,
  movePerson,
  saveCounsellor as storeCounsellor,
  saveTutor as storeTutor,
  type PersonSaveResult,
} from "@/lib/cms/people";
import type { CounsellorInput, TutorInput } from "@/lib/cms/validation";
import { counsellorsTag, tutorsTag } from "@/lib/people";
import { adsTag } from "@/lib/sponsors";
import type { AdInput } from "@/lib/sponsors/schema";
import { articlesTag } from "@/lib/articles";
import { homeTag, saveHomeContent, type HomeSaveResult } from "@/lib/home";
import { deleteTestimonial, moveTestimonial, saveTestimonial, type TestimonialSaveResult } from "@/lib/cms/testimonials";
import { testimonialsTag } from "@/lib/testimonials";
import type { TestimonialInput } from "@/lib/testimonials/schema";
import { deleteExpo, moveExpo, saveExpo, type ExpoSaveResult } from "@/lib/cms/expos";
import { exposTag } from "@/lib/expos";
import type { ExpoInput } from "@/lib/expos/schema";
import { deleteFaq, moveFaq, saveFaq, type FaqSaveResult } from "@/lib/cms/faqs";
import { deleteStory, moveStory, saveStory, type StorySaveResult } from "@/lib/cms/stories";
import { faqsTag } from "@/lib/faqs";
import { deleteLead } from "@/lib/cms/leads";
import { assignLeads, resendLeadAlert, type AssignResult } from "@/lib/leads/assign";
import type { FaqInput } from "@/lib/faqs/schema";
import { storiesTag } from "@/lib/stories";
import type { StoryInput } from "@/lib/stories/schema";

export async function saveArticle(input: ArticleInput): Promise<SaveResult> {
  const user = await requireUser();
  const result = await storeArticle(user, input);
  if (result.ok) updateTag(articlesTag);
  return result;
}

export async function deleteArticle(id: string) {
  const user = await requireUser();
  const result = await removeArticle(user, id);
  if (!result.ok) return result;
  updateTag(articlesTag);
  redirect("/admin/articles");
}

export type UserFormState = { ok: boolean; message: string; fieldErrors?: Record<string, string> } | null;

export async function createUser(_previous: UserFormState, formData: FormData): Promise<UserFormState> {
  await requireAdmin();
  const result = await addUser(Object.fromEntries(formData));
  if (!result.ok) return result;
  refresh();
  return { ok: true, message: "Account created. Share the password through a private channel." };
}

export async function resetUserPasswordAction(id: string) {
  const actor = await requireAdmin();
  return resetUserPassword(actor, id);
}

export async function removeUser(id: string) {
  const actor = await requireAdmin();
  const result = await dropUser(actor, id);
  if (result.ok) refresh();
  return result;
}

// Program changes refresh the cached public pages (nav, list, detail, forms) right away.
export async function saveProgram(input: ProgramInput): Promise<ProgramSaveResult> {
  await requireUser();
  const result = await storeProgram(input);
  if (result.ok) updateTag(programsTag);
  return result;
}

export async function deleteProgram(id: string) {
  const user = await requireUser();
  const result = await removeProgram(user, id);
  if (!result.ok) return result;
  updateTag(programsTag);
  redirect("/admin/programs");
}

export async function moveProgram(id: string, direction: "up" | "down") {
  await requireUser();
  const result = await reorderProgram(id, direction);
  if (result.ok) {
    updateTag(programsTag);
    refresh();
  }
  return result;
}

const personTags = { counsellor: counsellorsTag, tutor: tutorsTag } as const;

export async function saveCounsellor(input: CounsellorInput): Promise<PersonSaveResult> {
  await requireUser();
  const result = await storeCounsellor(input);
  if (result.ok) updateTag(counsellorsTag);
  return result;
}

export async function saveTutor(input: TutorInput): Promise<PersonSaveResult> {
  await requireUser();
  const result = await storeTutor(input);
  if (result.ok) updateTag(tutorsTag);
  return result;
}

export async function deletePersonAction(kind: "counsellor" | "tutor", id: string) {
  const user = await requireUser();
  const result = await deletePerson(user, kind, id);
  if (!result.ok) return result;
  updateTag(personTags[kind]);
  redirect(kind === "counsellor" ? "/admin/counsellors" : "/admin/tutors");
}

export async function movePersonAction(kind: "counsellor" | "tutor", id: string, direction: "up" | "down") {
  await requireUser();
  const result = await movePerson(kind, id, direction);
  updateTag(personTags[kind]);
  refresh();
  return result;
}

// Campaign changes refresh every page with a sponsored slot.
export async function saveAdAction(input: AdInput): Promise<AdSaveResult> {
  await requireUser();
  const result = await storeAd(input);
  if (result.ok) updateTag(adsTag);
  return result;
}

export async function deleteAdAction(id: string) {
  const user = await requireUser();
  const result = await removeAd(user, id);
  if (!result.ok) return result;
  updateTag(adsTag);
  redirect("/admin/ads");
}

// Homepage content: every headline, paragraph, photo, and key figure on the home page.
export async function saveHomeAction(input: unknown): Promise<HomeSaveResult> {
  await requireUser();
  const result = await saveHomeContent(input);
  if (result.ok) updateTag(homeTag);
  return result;
}

export async function saveTestimonialAction(input: TestimonialInput): Promise<TestimonialSaveResult> {
  await requireUser();
  const result = await saveTestimonial(input);
  if (result.ok) updateTag(testimonialsTag);
  return result;
}

export async function deleteTestimonialAction(id: string) {
  const user = await requireUser();
  const result = await deleteTestimonial(user, id);
  if (!result.ok) return result;
  updateTag(testimonialsTag);
  redirect("/admin/testimonials");
}

export async function moveTestimonialAction(id: string, direction: "up" | "down") {
  await requireUser();
  const result = await moveTestimonial(id, direction);
  updateTag(testimonialsTag);
  refresh();
  return result;
}

// Expos refresh /expo and the home page's Expo card.
export async function saveExpoAction(input: ExpoInput): Promise<ExpoSaveResult> {
  await requireUser();
  const result = await saveExpo(input);
  if (result.ok) updateTag(exposTag);
  return result;
}

export async function deleteExpoAction(id: string) {
  const user = await requireUser();
  const result = await deleteExpo(user, id);
  if (!result.ok) return result;
  updateTag(exposTag);
  redirect("/admin/expos");
}

export async function moveExpoAction(id: string, direction: "up" | "down") {
  await requireUser();
  const result = await moveExpo(id, direction);
  updateTag(exposTag);
  refresh();
  return result;
}

export async function saveStoryAction(input: StoryInput): Promise<StorySaveResult> {
  await requireUser();
  const result = await saveStory(input);
  if (result.ok) updateTag(storiesTag);
  return result;
}

export async function deleteStoryAction(id: string) {
  const user = await requireUser();
  const result = await deleteStory(user, id);
  if (!result.ok) return result;
  updateTag(storiesTag);
  redirect("/admin/stories");
}

export async function moveStoryAction(id: string, direction: "up" | "down") {
  await requireUser();
  const result = await moveStory(id, direction);
  updateTag(storiesTag);
  refresh();
  return result;
}

export async function saveFaqAction(input: FaqInput): Promise<FaqSaveResult> {
  await requireUser();
  const result = await saveFaq(input);
  if (result.ok) updateTag(faqsTag);
  return result;
}

export async function deleteFaqAction(id: string) {
  const user = await requireUser();
  const result = await deleteFaq(user, id);
  if (!result.ok) return result;
  updateTag(faqsTag);
  redirect("/admin/faqs");
}

export async function moveFaqAction(id: string, direction: "up" | "down") {
  await requireUser();
  const result = await moveFaq(id, direction);
  updateTag(faqsTag);
  refresh();
  return result;
}

export async function deleteLeadAction(id: string) {
  const user = await requireUser();
  const result = await deleteLead(user, id);
  if (!result.ok) return result;
  console.info("[leads] Deleted", { id, by: user.email });
  redirect("/admin/leads");
}

export async function assignLeadsAction(ids: string[], counsellorId: string | null): Promise<AssignResult> {
  const user = await requireUser();
  const result = await assignLeads(user, ids, counsellorId);
  if (result.ok) refresh();
  return result;
}

export async function resendLeadAlertAction(id: string) {
  const user = await requireUser();
  const result = await resendLeadAlert(user, id);
  if (result.ok) refresh();
  return result;
}
