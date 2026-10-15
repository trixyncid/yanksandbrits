import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/i18n/routing";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** A site path. The site is English only, so URLs carry no language prefix. */
export function localePath(_locale: Locale, path = "/") {
  return path.startsWith("/") ? path : `/${path}`;
}
