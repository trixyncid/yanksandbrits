-- Student stories and FAQs. Additive only: two new tables.

-- CreateTable
CREATE TABLE "story" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "program" TEXT NOT NULL DEFAULT '',
    "scoreLabel" TEXT NOT NULL DEFAULT '',
    "scoreBefore" TEXT NOT NULL DEFAULT '',
    "scoreAfter" TEXT NOT NULL DEFAULT '',
    "destination" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT '',
    "intake" TEXT NOT NULL DEFAULT '',
    "photo" TEXT,
    "photoAlt" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "consentNote" TEXT NOT NULL DEFAULT '',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "programs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "showOnContact" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "story_slug_key" ON "story"("slug");

-- CreateIndex
CREATE INDEX "story_published_sortOrder_idx" ON "story"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "faq_published_sortOrder_idx" ON "faq"("published", "sortOrder");
