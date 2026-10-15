-- CreateEnum
CREATE TYPE "AdKind" AS ENUM ('university', 'brand');

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "data" BYTEA NOT NULL,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counsellor" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "onDesk" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counsellor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "programs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "advertiser" TEXT NOT NULL,
    "kind" "AdKind" NOT NULL DEFAULT 'brand',
    "country" TEXT,
    "city" TEXT,
    "majors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "slots" TEXT[],
    "programs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startsOn" DATE NOT NULL,
    "endsOn" DATE NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "href" TEXT NOT NULL,
    "image" TEXT,
    "logo" TEXT,
    "copy" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_createdAt_idx" ON "media"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "counsellor_slug_key" ON "counsellor"("slug");

-- CreateIndex
CREATE INDEX "counsellor_published_sortOrder_idx" ON "counsellor"("published", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_slug_key" ON "tutor"("slug");

-- CreateIndex
CREATE INDEX "tutor_published_sortOrder_idx" ON "tutor"("published", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ad_slug_key" ON "ad"("slug");

-- CreateIndex
CREATE INDEX "ad_active_endsOn_idx" ON "ad"("active", "endsOn");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
