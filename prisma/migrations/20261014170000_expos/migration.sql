-- Expos and briefings for /expo and the home page. Additive only: one new table.

-- CreateTable
CREATE TABLE "expo" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT '',
    "covers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "image" TEXT,
    "imageAlt" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "venue" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT 'Medan',
    "registerUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expo_slug_key" ON "expo"("slug");

-- CreateIndex
CREATE INDEX "expo_published_startsAt_idx" ON "expo"("published", "startsAt");
