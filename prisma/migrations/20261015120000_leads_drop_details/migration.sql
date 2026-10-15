-- The contact form is single-step; the optional details step was removed.
-- AlterTable
ALTER TABLE "lead" DROP COLUMN "country",
DROP COLUMN "detailsAt",
DROP COLUMN "education",
DROP COLUMN "email",
DROP COLUMN "intake",
DROP COLUMN "notes";

