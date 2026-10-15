import { routing, type Locale } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export async function resolveLocale(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  if (!routing.locales.some((item) => item === locale)) notFound();
  setRequestLocale(locale);
  return locale as Locale;
}
