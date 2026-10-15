// Run with `bun run db:seed`.
// 1. Creates or promotes the first admin from ADMIN_EMAIL, ADMIN_PASSWORD, and optional ADMIN_NAME.
// 2. Imports the bundled English programs when the CMS has none, so editors start from the current copy.
//    Counsellors and tutors are never seeded: add real people in the CMS.
// 5. Imports the starting FAQ the first time.
// 4. Imports the expo formats from the Expo page the first time, published but without dates.
// 3. Stores the homepage content (headlines, text, photos) the first time, so the Homepage editor
//    owns it from then on. Never overwrites what an editor saved.
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { getBundle, getBundledFaqs } from "../src/lib/content";
import { defaultHomeContent } from "../src/lib/home/defaults";
import { fallbackPrograms } from "../src/lib/programs/fallback";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || password.length < 10) {
    console.log("Admin skipped: set ADMIN_EMAIL and ADMIN_PASSWORD (at least 10 characters) in .env.local to create one.");
    return;
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    await db.user.update({ where: { id: existing.id }, data: { role: "admin" } });
    console.log(`${email} already exists. Role set to admin; password unchanged.`);
    return;
  }

  const id = crypto.randomUUID();
  await db.user.create({
    data: {
      id,
      name,
      email,
      emailVerified: true,
      role: "admin",
      accounts: {
        create: { id: crypto.randomUUID(), accountId: id, providerId: "credential", password: await hashPassword(password) },
      },
    },
  });
  console.log(`Admin ${email} created. Sign in at /admin/login.`);
}

async function seedPrograms() {
  // The site is English only. Import the English programs unless the CMS already has them.
  if ((await db.program.count({ where: { locale: "en" } })) > 0) {
    console.log("Programs skipped: the CMS already has English programs.");
    return;
  }
  // Keep the order, images, and visibility editors already chose on the older Bahasa records.
  const bahasa = await db.program.findMany({ where: { locale: "id" }, select: { slug: true, sortOrder: true, published: true, image: true, imageAlt: true } });
  const chosen = new Map(bahasa.map((row) => [row.slug, row]));
  const programs = fallbackPrograms("en");
  await db.program.createMany({
    data: programs.map((program, index) => {
      const previous = chosen.get(program.slug);
      return {
        locale: "en",
        sortOrder: previous?.sortOrder ?? index,
        published: previous?.published ?? true,
        slug: program.slug,
        category: program.category,
        name: program.name,
        tag: program.tag,
        headline: program.headline,
        summary: program.summary,
        targetAudience: program.targetAudience,
        format: program.format,
        formatLabel: program.formatLabel,
        duration: program.duration,
        schedule: program.schedule,
        level: program.level,
        outcomes: program.outcomes,
        syllabus: program.syllabus,
        image: previous?.image || program.image,
        imageAlt: previous?.imageAlt || program.imageAlt || null,
        seoTitle: program.seoTitle,
        seoDescription: program.seoDescription,
      };
    }),
  });
  console.log(`Imported ${programs.length} English programs${bahasa.length ? ", keeping the order and images of the Bahasa records" : ""}.`);
}

async function seedExpos() {
  if ((await db.expo.count()) > 0) {
    console.log("Expos skipped: the CMS already has expos.");
    return;
  }
  // The formats the site already describes. Dates stay empty until each session is confirmed.
  const formats = getBundle("en").expoPage.events;
  await db.expo.createMany({
    data: formats.map((format, sortOrder) => ({
      slug: format.slug,
      name: format.name,
      summary: format.summary,
      audience: format.audience,
      covers: format.covers,
      image: format.image,
      city: "Medan",
      published: true,
      sortOrder,
    })),
  });
  console.log(`Imported ${formats.length} expo formats without dates. Add dates in the CMS under Expos once confirmed.`);
}

async function seedFaqs() {
  if ((await db.faq.count()) > 0) {
    console.log("FAQ skipped: the CMS already has questions.");
    return;
  }
  const onContact = new Set(["format", "counsellor", "guarantee", "parents"]);
  const label = (category: string) => category.charAt(0).toUpperCase() + category.slice(1);
  const faqs = getBundledFaqs("en");
  await db.faq.createMany({
    data: faqs.map((faq, sortOrder) => ({
      question: faq.question,
      answer: faq.answer,
      category: faq.category === "program" ? "Programs" : label(faq.category),
      programs: faq.relatedProgram ? [faq.relatedProgram] : [],
      showOnContact: onContact.has(faq.id),
      published: true,
      sortOrder,
    })),
  });
  console.log(`Imported ${faqs.length} questions.`);
}

async function seedHomeContent() {
  if (await db.siteContent.findUnique({ where: { key: "home" }, select: { key: true } })) {
    console.log("Homepage skipped: the CMS already has homepage content.");
    return;
  }
  await db.siteContent.create({ data: { key: "home", data: defaultHomeContent() } });
  console.log("Stored the homepage content. Edit it in the CMS under Homepage.");
}

await seedAdmin();
await seedPrograms();
await seedHomeContent();
await seedExpos();
await seedFaqs();
await db.$disconnect();
