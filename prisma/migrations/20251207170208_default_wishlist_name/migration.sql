-- DropIndex
DROP INDEX "public"."WishlistItem_offerId_idx";

-- DropIndex
DROP INDEX "public"."WishlistItem_wishlistId_idx";

-- AlterTable
ALTER TABLE "Wishlist" ALTER COLUMN "name" SET DEFAULT 'Meus favoritos';
