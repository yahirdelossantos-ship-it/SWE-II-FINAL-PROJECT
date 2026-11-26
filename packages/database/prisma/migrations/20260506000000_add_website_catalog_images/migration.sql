-- Add optional image URLs/paths for website add-ons and events.
ALTER TABLE "AddOnProduct" ADD COLUMN "image" TEXT;
ALTER TABLE "Event" ADD COLUMN "image" TEXT;
