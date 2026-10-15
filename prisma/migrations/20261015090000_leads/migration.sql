-- CreateEnum
CREATE TYPE "LeadOrigin" AS ENUM ('contact', 'whatsapp');

-- CreateTable
CREATE TABLE "lead" (
    "id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "origin" "LeadOrigin" NOT NULL DEFAULT 'contact',
    "name" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "programs" TEXT[],
    "email" TEXT,
    "education" TEXT,
    "country" TEXT,
    "intake" TEXT,
    "notes" TEXT,
    "detailsAt" TIMESTAMP(3),
    "channel" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "firstUtmSource" TEXT,
    "firstUtmMedium" TEXT,
    "firstUtmCampaign" TEXT,
    "referrer" TEXT,
    "landingPage" TEXT,
    "device" TEXT,
    "ipHash" TEXT,
    "submissions" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_createdAt_idx" ON "lead"("createdAt");

-- CreateIndex
CREATE INDEX "lead_whatsapp_createdAt_idx" ON "lead"("whatsapp", "createdAt");

-- CreateIndex
CREATE INDEX "lead_ipHash_createdAt_idx" ON "lead"("ipHash", "createdAt");

