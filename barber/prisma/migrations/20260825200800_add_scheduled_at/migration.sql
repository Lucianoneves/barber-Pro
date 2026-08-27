-- AlterTable
ALTER TABLE "services" ADD COLUMN "scheduled_at" TIMESTAMP(3);

UPDATE "services" SET "scheduled_at" = "createdAt" WHERE "scheduled_at" IS NULL;

ALTER TABLE "services" ALTER COLUMN "scheduled_at" SET NOT NULL;
