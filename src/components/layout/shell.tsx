import { WhatsappLeadProvider } from "@/components/forms/whatsapp-lead-dialog";
import { branches, mapsHref, openingHours } from "@/content/branches";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteNav, SiteNavFallback, type NavModel } from "@/components/layout/site-nav";
import { FacebookIcon, InstagramIcon, TikTokIcon, YoutubeIcon, WhatsappIcon } from "@/components/layout/social-icons";
import { StickyHeader } from "@/components/layout/sticky-header";
import { AttributionCapture, FloatingWhatsapp, ScrollDepth, WhatsappButton } from "@/components/layout/trackers";
import type { Bundle } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import type { Program } from "@/lib/programs/types";
import { getSettings, messageFor, whatsappHref } from "@/lib/content";
import { localePath } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";


export function Shell({ locale, copy, programs, children }: { locale: Locale; copy: Bundle; programs: Program[]; children: ReactNode }) {
  const settings = getSettings();
  const company = settings.companyName;
  const consult = localePath(locale, "/contact");
  const generalWa = whatsappHref(messageFor(copy.whatsapp.generalText, {}));
  const nav: NavModel = {
    label: copy.navMenu.label,
    programs: {
      label: copy.nav.programs,
      href: localePath(locale, "/programs"),
      allLabel: copy.navMenu.allPrograms,
      items: programs.map((program) => ({
        href: localePath(locale, `/programs/${program.slug}`),
        name: program.name,
        tag: program.tag,
        summary: program.summary,
      })),
      help: { title: copy.navMenu.helpTitle, body: copy.navMenu.helpBody, cta: copy.nav.cta, href: `${consult}#form` },
    },
    links: [
      { href: localePath(locale, "/study-abroad"), label: copy.nav.studyAbroad },
      { href: localePath(locale, "/counselling"), label: copy.nav.counselling },
      { href: localePath(locale, "/tutors"), label: copy.nav.tutors },
    ],
    explore: {
      label: copy.navMenu.explore,
      items: [
        { href: localePath(locale, "/expo"), label: copy.nav.expo, body: copy.navMenu.descriptions.expo, icon: "expo" },
        { href: localePath(locale, "/articles"), label: copy.nav.articles, body: copy.navMenu.descriptions.articles, icon: "articles" },
        { href: localePath(locale, "/success-stories"), label: copy.footer.success, body: copy.navMenu.descriptions.stories, icon: "stories" },
        { href: localePath(locale, "/faq"), label: copy.footer.faq, body: copy.navMenu.descriptions.faq, icon: "faq" },
      ],
    },
    contact: { href: consult, label: copy.nav.contact },
  };
  // Only profiles that are set; the Social heading is left out when there are none.
  const socials = [
    { href: settings.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: settings.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: settings.youtube, label: "YouTube", Icon: YoutubeIcon },
    { href: settings.facebook, label: "Facebook", Icon: FacebookIcon },
  ].flatMap((social) => (social.href ? [{ ...social, href: social.href }] : []));

  return (
    <WhatsappLeadProvider
      locale={locale}
      form={copy.form}
      popup={copy.whatsapp}
      closeLabel={"Close"}
      programs={programs.map((program) => ({ slug: program.slug, name: program.name }))}
    >
      <a className="skip-link" href="#content">
        {copy.a11y.skip}
      </a>
      <StickyHeader>
        <div className="mx-auto flex h-[var(--header-h)] w-full max-w-6xl items-center gap-3 px-4 md:px-6">
          <Link href={localePath(locale)} className="relative flex h-9 w-[7.25rem] shrink-0 items-center sm:h-10 sm:w-36" aria-label={company ?? "Yanks and Brits"}>
            <Image src="/yb-logo.svg" alt={company ?? "Yanks and Brits"} fill className="object-contain object-left transition-[filter] duration-300 group-data-[tone=dark]/header:brightness-0 group-data-[tone=dark]/header:invert" sizes="144px" priority />
          </Link>
          <Suspense fallback={<SiteNavFallback nav={nav} />}>
            <SiteNav nav={nav} />
          </Suspense>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Link
              href={`${consult}#form`}
              className="hidden min-h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 lg:inline-flex"
            >
              {copy.nav.cta}
            </Link>
            <MobileNav
              label={copy.a11y.menu}
              closeLabel={copy.a11y.close}
              logoLabel={company ?? "Yanks and Brits"}
              nav={nav}
              cta={{ label: copy.nav.cta, href: `${consult}#form` }}
              whatsapp={{ label: copy.whatsapp.float, href: generalWa }}
            />
          </div>
        </div>
      </StickyHeader>
      <main id="content" className="flex-1 pb-[calc(var(--bar-h)+1rem)] lg:pb-0">
        {children}
      </main>
      <footer className="bg-header text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 md:px-6 md:grid-cols-4">
          <div>
            <Link
              href={localePath(locale)}
              className="relative block h-10 w-40"
              aria-label={company ?? "Home"}
            >
              <Image
                src="/yb-logo.svg"
                alt={company ?? ""}
                fill
                className="object-contain object-left brightness-0 invert"
                sizes="160px"
              />
            </Link>
            {settings.tagline ? <p className="mt-4 text-sm leading-6 text-white/75">{settings.tagline}</p> : null}
            <ul className="mt-5 space-y-4 text-sm leading-6">
              {branches.map((branch) => (
                <li key={branch.name}>
                  <p className="font-semibold">{branch.name}</p>
                  <a href={mapsHref(branch)} target="_blank" rel="noopener noreferrer" className="text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline">
                    {branch.address}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-5 text-sm leading-6">
              <p className="font-semibold">{copy.footer.hours}</p>
              {openingHours.map((slot) => (
                <p key={slot.days} className="text-white/75">
                  {slot.days}: {slot.opens} - {slot.closes} WIB
                </p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">{copy.footer.programs}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {programs.map((program) => (
                <li key={program.slug}>
                  <Link href={localePath(locale, `/programs/${program.slug}`)} className="underline-offset-4 hover:underline">
                    {program.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">{copy.footer.company}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href={localePath(locale, "/faq")}>{copy.footer.faq}</Link></li>
              <li><Link href={localePath(locale, "/success-stories")}>{copy.footer.success}</Link></li>
              <li><Link href={localePath(locale, "/contact")}>{copy.nav.contact}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">{copy.footer.legal}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href={localePath(locale, "/privacy")}>{copy.footer.privacy}</Link></li>
              <li><Link href={localePath(locale, "/terms")}>{copy.footer.terms}</Link></li>
            </ul>
            {socials.length ? (
              <>
                <p className="mt-6 text-sm font-semibold">{copy.footer.social}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {socials.map(({ href, label, Icon }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="grid size-11 place-items-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/15"
                      >
                        <Icon className="size-5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-6xl px-4 py-5 text-sm text-white/60 md:px-6">{copy.footer.cityNote}</p>
        </div>
      </footer>
      <div className="fixed inset-x-0 bottom-0 z-[var(--z-bar)] grid grid-cols-2 gap-2 border-t border-line bg-white p-2 lg:hidden">
        <WhatsappButton
          href={generalWa}
          fallbackHref={`${consult}#form`}
          label={copy.whatsapp.float}
          page="mobile-bar"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line px-3 text-sm font-semibold"
        >
          <WhatsappIcon className="size-4" />
          WhatsApp
        </WhatsappButton>
        <Link href={`${consult}#form`} className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-3 text-sm font-semibold text-white">
          {copy.nav.cta}
        </Link>
      </div>
      <FloatingWhatsapp href={generalWa} fallbackHref={`${consult}#form`} label={copy.whatsapp.float} />
      <AttributionCapture />
      <ScrollDepth />
    </WhatsappLeadProvider>
  );
}
