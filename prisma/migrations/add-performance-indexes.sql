-- Performance indexes to support browse/search, chat, notifications, wishlist and sales queries.

CREATE INDEX IF NOT EXISTS "idx_offers_status_category_seller_created_desc"
ON "Offer" ("status", "categoryId", "sellerId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_offers_search"
ON "Offer"
USING GIN (to_tsvector('portuguese', coalesce("title", '') || ' ' || coalesce("description", '')));

CREATE INDEX IF NOT EXISTS "idx_chats_participants_gin"
ON "Participant"
USING GIN (to_tsvector('simple', coalesce("userId", '')));

CREATE INDEX IF NOT EXISTS "idx_messages_chat_created_desc"
ON "Message" ("chatId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_messages_unread_by_chat"
ON "Message" ("status", "chatId", "createdAt" DESC)
WHERE "status" <> 'READ';

CREATE INDEX IF NOT EXISTS "idx_notifications_unread_by_user"
ON "Notification" ("userId", "isRead", "createdAt" DESC)
WHERE "isRead" = false;

CREATE INDEX IF NOT EXISTS "idx_wishlists_offer_user"
ON "Wishlist" ("offerId", "userId");

CREATE INDEX IF NOT EXISTS "idx_sales_completed_offer_buyer"
ON "Sale" ("buyerId", "offerId")
WHERE "status" = 'COMPLETED';
