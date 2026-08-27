-- AlterTable
ALTER TABLE "users" ADD COLUMN "slug" TEXT;
ALTER TABLE "users" ADD COLUMN "slot_interval_minutes" INTEGER NOT NULL DEFAULT 30;

UPDATE "users"
SET "slug" = 'barbearia-' || REPLACE("id", '-', '')
WHERE "slug" IS NULL;

ALTER TABLE "users" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "users_slug_key" ON "users"("slug");

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "customers_user_id_phone_key" ON "customers"("user_id", "phone");

ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "business_hours" (
    "id" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "opens_at" TEXT,
    "closes_at" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "business_hours_user_id_weekday_key" ON "business_hours"("user_id", "weekday");

ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "business_hours" ("id", "weekday", "closed", "opens_at", "closes_at", "createdAt", "updatedAt", "user_id")
SELECT
    u."id" || '-h' || d.weekday,
    d.weekday,
    d.closed,
    d.opens_at,
    d.closes_at,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    u."id"
FROM "users" u
CROSS JOIN (
    VALUES
        (0, TRUE, NULL, NULL),
        (1, TRUE, NULL, NULL),
        (2, FALSE, '09:00', '19:00'),
        (3, FALSE, '09:00', '19:00'),
        (4, FALSE, '09:00', '19:00'),
        (5, FALSE, '09:00', '19:00'),
        (6, FALSE, '09:00', '19:00')
) AS d(weekday, closed, opens_at, closes_at);

-- AlterTable
ALTER TABLE "services" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'shop';
ALTER TABLE "services" ADD COLUMN "customer_id" TEXT;

ALTER TABLE "services" ADD CONSTRAINT "services_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DELETE FROM "services" a
USING "services" b
WHERE a."user_id" = b."user_id"
  AND a."scheduled_at" = b."scheduled_at"
  AND a."id" > b."id";

CREATE UNIQUE INDEX "services_user_id_scheduled_at_key" ON "services"("user_id", "scheduled_at");
