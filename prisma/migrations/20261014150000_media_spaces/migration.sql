-- Uploaded files can live in DigitalOcean Spaces. Existing rows keep their bytes in "data".
-- AlterTable
ALTER TABLE "media" ADD COLUMN     "storageKey" TEXT,
ALTER COLUMN "data" DROP NOT NULL;
