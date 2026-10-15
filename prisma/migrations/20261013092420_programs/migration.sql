-- CreateEnum
CREATE TYPE "ProgramCategory" AS ENUM ('language', 'academic');

-- CreateEnum
CREATE TYPE "ProgramFormat" AS ENUM ('online', 'offline', 'hybrid');

-- CreateTable
CREATE TABLE "program" (
    "id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'id',
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "category" "ProgramCategory" NOT NULL DEFAULT 'language',
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL DEFAULT '',
    "headline" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "targetAudience" TEXT NOT NULL DEFAULT '',
    "format" "ProgramFormat" NOT NULL DEFAULT 'hybrid',
    "formatLabel" TEXT NOT NULL DEFAULT '',
    "duration" TEXT NOT NULL DEFAULT '',
    "schedule" TEXT NOT NULL DEFAULT '',
    "level" TEXT NOT NULL DEFAULT '',
    "priceFrom" INTEGER,
    "priceNote" TEXT,
    "outcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "syllabus" JSONB NOT NULL DEFAULT '[]',
    "image" TEXT,
    "imageAlt" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "program_locale_published_sortOrder_idx" ON "program"("locale", "published", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "program_locale_slug_key" ON "program"("locale", "slug");
