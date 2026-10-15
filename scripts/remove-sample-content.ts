// Removes sample and placeholder content that earlier seeds put in the CMS database.
//
//   bun run content:clean-samples            # shows what would change
//   bun run content:clean-samples --apply    # changes it
//
// Safe to run more than once, and on any environment (it reads DATABASE_URL):
// - deletes the seeded "Sample counsellor" profiles;
// - unpublishes people with placeholder names (e.g. "John Doe"), so an editor can fix or delete them;
// - clears the invented duration and timetable from programs;
// - rewrites FAQ answers that quote sample figures (they stay hidden until an editor publishes them).
import { db } from "../src/lib/db";
import { getBundledFaqs } from "../src/lib/content";

const apply = process.argv.includes("--apply");
const placeholderName = /^(john|jane) doe$|^(test|sample|example|lorem)\b/i;
const sampleDuration = /^(12 weeks|12 minggu)$/i;
const sampleSchedule = /^(tue & thu, 16:00|selasa & kamis, 16\.00)$/i;
// The sentence that names a sample timetable, in either language.
const sampleTimetable = /\s*(sample timetable|contoh jadwal)[^.]*\.?/gi;

const changes: string[] = [];

// By name only: an editor may have turned a seeded sample into a real person and kept its "-sample" slug.
const sampleCounsellors = await db.counsellor.findMany({ where: { name: { startsWith: "Sample counsellor" } }, select: { id: true, name: true } });
const deleted = new Set(sampleCounsellors.map((counsellor) => counsellor.id));
for (const counsellor of sampleCounsellors) changes.push(`delete counsellor "${counsellor.name}"`);
if (apply && sampleCounsellors.length) await db.counsellor.deleteMany({ where: { id: { in: sampleCounsellors.map((c) => c.id) } } });

for (const kind of ["counsellor", "tutor"] as const) {
  const rows = kind === "counsellor" ? await db.counsellor.findMany({ where: { published: true }, select: { id: true, name: true } }) : await db.tutor.findMany({ where: { published: true }, select: { id: true, name: true } });
  for (const row of rows.filter((person) => !deleted.has(person.id) && placeholderName.test(person.name.trim()))) {
    changes.push(`unpublish ${kind} "${row.name}" (placeholder name)`);
    if (apply) await (kind === "counsellor" ? db.counsellor.update({ where: { id: row.id }, data: { published: false } }) : db.tutor.update({ where: { id: row.id }, data: { published: false } }));
  }
}

const programs = await db.program.findMany({ select: { id: true, locale: true, slug: true, duration: true, schedule: true, formatLabel: true } });
for (const program of programs) {
  const data: { duration?: string; schedule?: string; formatLabel?: string } = {};
  if (sampleDuration.test(program.duration.trim())) data.duration = "";
  if (sampleSchedule.test(program.schedule.trim())) data.schedule = "";
  const label = program.formatLabel.replace(sampleTimetable, "").trim();
  if (label !== program.formatLabel) data.formatLabel = label;
  if (Object.keys(data).length) {
    changes.push(`program ${program.locale}/${program.slug}: clear ${Object.keys(data).join(", ")}`);
    if (apply) await db.program.update({ where: { id: program.id }, data });
  }
}

const answers = new Map(getBundledFaqs("en").map((faq) => [faq.question, faq.answer]));
const faqs = await db.faq.findMany({ select: { id: true, question: true, answer: true } });
for (const faq of faqs.filter((row) => /\bsample\b/i.test(row.answer))) {
  const answer = answers.get(faq.question);
  if (!answer || /\bsample\b/i.test(answer)) {
    changes.push(`FAQ "${faq.question}": quotes sample figures, no replacement found; edit it in the CMS`);
    continue;
  }
  changes.push(`FAQ "${faq.question}": replace sample answer`);
  if (apply) await db.faq.update({ where: { id: faq.id }, data: { answer } });
}

console.log(changes.length ? changes.map((line) => `- ${line}`).join("\n") : "Nothing to clean.");
console.log(apply ? `\nApplied ${changes.length} change(s).` : `\nDry run. Run again with --apply to make ${changes.length} change(s).`);
await db.$disconnect();
