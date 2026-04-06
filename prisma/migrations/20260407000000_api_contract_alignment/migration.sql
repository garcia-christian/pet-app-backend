-- Rename avatarUrl to image on users table
ALTER TABLE "users" RENAME COLUMN "avatarUrl" TO "image";

-- Add inviteCode to households table
ALTER TABLE "households" ADD COLUMN "inviteCode" TEXT NOT NULL DEFAULT gen_random_uuid()::text;
CREATE UNIQUE INDEX "households_inviteCode_key" ON "households"("inviteCode");

-- Create meal_schedules table
CREATE TABLE "meal_schedules" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "mealName" TEXT NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "graceMinutes" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_schedules_pkey" PRIMARY KEY ("id")
);

-- Create feeding_events table
CREATE TABLE "feeding_events" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "mealScheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feeding_events_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys for meal_schedules
ALTER TABLE "meal_schedules" ADD CONSTRAINT "meal_schedules_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign keys for feeding_events
ALTER TABLE "feeding_events" ADD CONSTRAINT "feeding_events_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feeding_events" ADD CONSTRAINT "feeding_events_mealScheduleId_fkey" FOREIGN KEY ("mealScheduleId") REFERENCES "meal_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feeding_events" ADD CONSTRAINT "feeding_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
