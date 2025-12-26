/*
  Warnings:

  - You are about to drop the column `name` on the `Wishlist` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Wishlist` table. All the data in the column will be lost.
  - You are about to drop the `WishlistItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,offerId]` on the table `Wishlist` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Wishlist" DROP CONSTRAINT "Wishlist_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WishlistItem" DROP CONSTRAINT "WishlistItem_offerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WishlistItem" DROP CONSTRAINT "WishlistItem_wishlistId_fkey";

-- DropIndex
DROP INDEX "public"."Wishlist_userId_idx";

-- DropIndex
DROP INDEX "public"."Wishlist_userId_key";

-- AlterTable
ALTER TABLE "Wishlist" DROP COLUMN "name",
DROP COLUMN "updatedAt",
ADD COLUMN     "offerId" TEXT;

-- DropTable
DROP TABLE "public"."WishlistItem";

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_offerId_key" ON "Wishlist"("userId", "offerId");

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
