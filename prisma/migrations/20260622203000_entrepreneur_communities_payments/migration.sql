-- CreateEnum
CREATE TYPE "EntrepreneurProfileStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EntrepreneurSubscriptionStatus" AS ENUM ('ACTIVE', 'PENDING_PAYMENT', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE_SIMULATED');

-- CreateEnum
CREATE TYPE "PaymentSessionStatus" AS ENUM ('CREATED', 'PENDING', 'PAID', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "CommunityMemberRole" AS ENUM ('MEMBER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "CommunityMessageType" AS ENUM ('TEXT', 'OFFER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "entrepreneurVerifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN "entrepreneurCatalogCategoryId" TEXT;

-- CreateTable
CREATE TABLE "EntrepreneurProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phone" TEXT,
    "instagram" TEXT,
    "website" TEXT,
    "city" TEXT,
    "state" TEXT,
    "status" "EntrepreneurProfileStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntrepreneurProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrepreneurSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "EntrepreneurSubscriptionStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "amount" INTEGER NOT NULL DEFAULT 9900,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "startedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "lastPaymentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntrepreneurSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrepreneurStorefront" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "logoUrl" TEXT,
    "description" TEXT,
    "whatsapp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntrepreneurStorefront_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrepreneurFeaturedOffer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntrepreneurFeaturedOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrepreneurQuickReply" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntrepreneurQuickReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrepreneurCatalogCategory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntrepreneurCatalogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE_SIMULATED',
    "providerSessionId" TEXT NOT NULL,
    "status" "PaymentSessionStatus" NOT NULL DEFAULT 'CREATED',
    "checkoutUrl" TEXT NOT NULL,
    "successUrl" TEXT NOT NULL,
    "cancelUrl" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 9900,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "metadata" JSONB,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityMember" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CommunityMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityMessage" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "offerId" TEXT,
    "type" "CommunityMessageType" NOT NULL DEFAULT 'TEXT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EntrepreneurProfile_userId_key" ON "EntrepreneurProfile"("userId");
CREATE INDEX "EntrepreneurProfile_status_idx" ON "EntrepreneurProfile"("status");
CREATE INDEX "EntrepreneurProfile_userId_status_idx" ON "EntrepreneurProfile"("userId", "status");

CREATE INDEX "EntrepreneurSubscription_userId_status_idx" ON "EntrepreneurSubscription"("userId", "status");
CREATE INDEX "EntrepreneurSubscription_expiresAt_idx" ON "EntrepreneurSubscription"("expiresAt");

CREATE UNIQUE INDEX "EntrepreneurStorefront_userId_key" ON "EntrepreneurStorefront"("userId");
CREATE UNIQUE INDEX "EntrepreneurStorefront_slug_key" ON "EntrepreneurStorefront"("slug");

CREATE UNIQUE INDEX "EntrepreneurFeaturedOffer_userId_offerId_key" ON "EntrepreneurFeaturedOffer"("userId", "offerId");
CREATE INDEX "EntrepreneurFeaturedOffer_userId_createdAt_idx" ON "EntrepreneurFeaturedOffer"("userId", "createdAt");
CREATE INDEX "EntrepreneurFeaturedOffer_offerId_idx" ON "EntrepreneurFeaturedOffer"("offerId");

CREATE INDEX "EntrepreneurQuickReply_userId_idx" ON "EntrepreneurQuickReply"("userId");

CREATE UNIQUE INDEX "EntrepreneurCatalogCategory_userId_name_key" ON "EntrepreneurCatalogCategory"("userId", "name");
CREATE INDEX "EntrepreneurCatalogCategory_userId_idx" ON "EntrepreneurCatalogCategory"("userId");
CREATE INDEX "Offer_entrepreneurCatalogCategoryId_idx" ON "Offer"("entrepreneurCatalogCategoryId");

CREATE UNIQUE INDEX "PaymentSession_providerSessionId_key" ON "PaymentSession"("providerSessionId");
CREATE INDEX "PaymentSession_userId_status_idx" ON "PaymentSession"("userId", "status");
CREATE INDEX "PaymentSession_subscriptionId_idx" ON "PaymentSession"("subscriptionId");

CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");
CREATE INDEX "Community_isActive_idx" ON "Community"("isActive");

CREATE UNIQUE INDEX "CommunityMember_communityId_userId_key" ON "CommunityMember"("communityId", "userId");
CREATE INDEX "CommunityMember_userId_idx" ON "CommunityMember"("userId");

CREATE INDEX "CommunityMessage_communityId_createdAt_idx" ON "CommunityMessage"("communityId", "createdAt" DESC);
CREATE INDEX "CommunityMessage_userId_idx" ON "CommunityMessage"("userId");
CREATE INDEX "CommunityMessage_offerId_idx" ON "CommunityMessage"("offerId");

-- AddForeignKey
ALTER TABLE "EntrepreneurProfile" ADD CONSTRAINT "EntrepreneurProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntrepreneurSubscription" ADD CONSTRAINT "EntrepreneurSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntrepreneurStorefront" ADD CONSTRAINT "EntrepreneurStorefront_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntrepreneurFeaturedOffer" ADD CONSTRAINT "EntrepreneurFeaturedOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntrepreneurFeaturedOffer" ADD CONSTRAINT "EntrepreneurFeaturedOffer_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntrepreneurQuickReply" ADD CONSTRAINT "EntrepreneurQuickReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntrepreneurCatalogCategory" ADD CONSTRAINT "EntrepreneurCatalogCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_entrepreneurCatalogCategoryId_fkey" FOREIGN KEY ("entrepreneurCatalogCategoryId") REFERENCES "EntrepreneurCatalogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PaymentSession" ADD CONSTRAINT "PaymentSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentSession" ADD CONSTRAINT "PaymentSession_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "EntrepreneurSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityMessage" ADD CONSTRAINT "CommunityMessage_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityMessage" ADD CONSTRAINT "CommunityMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityMessage" ADD CONSTRAINT "CommunityMessage_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
