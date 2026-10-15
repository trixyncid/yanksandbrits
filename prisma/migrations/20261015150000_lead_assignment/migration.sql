-- AlterTable
ALTER TABLE "counsellor" ADD COLUMN     "whatsapp" TEXT;

-- AlterTable
ALTER TABLE "lead" ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "assignedById" TEXT,
ADD COLUMN     "counsellorId" TEXT,
ADD COLUMN     "notifiedAt" TIMESTAMP(3),
ADD COLUMN     "notifyError" TEXT;

-- CreateIndex
CREATE INDEX "lead_counsellorId_createdAt_idx" ON "lead"("counsellorId", "createdAt");

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_counsellorId_fkey" FOREIGN KEY ("counsellorId") REFERENCES "counsellor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

