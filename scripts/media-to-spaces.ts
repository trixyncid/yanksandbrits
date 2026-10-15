// Copies uploads stored in the database into DigitalOcean Spaces. Run with `bun run media:to-spaces`.
//
//   --dry-run     list what would move, change nothing
//   --keep-data   copy to Spaces but leave the bytes in the database as well
//
// Each file is uploaded, its size checked in Spaces, and only then is the database row pointed at the
// object (and its bytes cleared, unless --keep-data). Safe to run again: moved files are skipped.
import { config } from "dotenv";

config({ path: [".env.local", ".env"], quiet: true });

const { PrismaPg } = await import("@prisma/adapter-pg");
const { PrismaClient } = await import("../src/generated/prisma/client");
const { newObjectKey, objectSize, putObject, spacesConfig } = await import("../src/lib/media/storage");

const dryRun = process.argv.includes("--dry-run");
const keepData = process.argv.includes("--keep-data");

const spaces = spacesConfig();
if (!spaces) {
  console.error("DigitalOcean Spaces is not configured. Set DO_SPACES_KEY, DO_SPACES_SECRET, DO_SPACES_BUCKET, and DO_SPACES_REGION first.");
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const pending = await db.media.findMany({ where: { storageKey: null, data: { not: null } }, orderBy: { createdAt: "asc" }, select: { id: true, filename: true, size: true } });
console.log(`${pending.length} file${pending.length === 1 ? "" : "s"} to copy to ${spaces.bucket} (${spaces.endpoint}, folder "${spaces.folder}").${dryRun ? " Dry run: nothing changes." : ""}`);

let moved = 0;
const failed: string[] = [];
for (const item of pending) {
  if (dryRun) {
    console.log(`  would copy ${item.id}  ${item.filename}  (${item.size} bytes)`);
    continue;
  }
  // Load one file at a time so a large library never sits in memory at once.
  const row = await db.media.findUnique({ where: { id: item.id }, select: { data: true, mimeType: true, createdAt: true } });
  if (!row?.data) continue;
  const key = newObjectKey(row.mimeType, row.createdAt);
  try {
    await putObject(key, row.data, row.mimeType);
    const stored = await objectSize(key);
    if (stored !== row.data.byteLength) throw new Error(`size check failed: expected ${row.data.byteLength}, Spaces has ${stored ?? "nothing"}`);
    await db.media.update({ where: { id: item.id }, data: { storageKey: key, ...(keepData ? {} : { data: null }) } });
    moved++;
    console.log(`  copied ${item.id} -> ${key}`);
  } catch (error) {
    failed.push(item.id);
    console.error(`  FAILED ${item.id}: ${error instanceof Error ? error.message : error}`);
  }
}

if (!dryRun) console.log(`Done. ${moved} copied${keepData ? " (database bytes kept)" : ""}, ${failed.length} failed.${failed.length ? " Run again to retry them." : ""}`);
await db.$disconnect();
process.exit(failed.length ? 1 : 0);
