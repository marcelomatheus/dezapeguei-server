/*
  Warnings:

  - Made the column `offerId` on table `Wishlist` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."Message_chatId_createdAt_idx";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "offerId" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Wishlist" ALTER COLUMN "offerId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Chat_offerId_idx" ON "Chat"("offerId");

-- CreateIndex
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Message_status_chatId_createdAt_idx" ON "Message"("status", "chatId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Message_deletedAt_idx" ON "Message"("deletedAt");

-- CreateIndex
CREATE INDEX "Offer_categoryId_status_createdAt_idx" ON "Offer"("categoryId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Offer_deletedAt_idx" ON "Offer"("deletedAt");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
