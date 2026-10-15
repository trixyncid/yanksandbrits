-- Prices are not shown to clients, so the CMS no longer stores them.
ALTER TABLE "program" DROP COLUMN "priceFrom",
DROP COLUMN "priceNote";
