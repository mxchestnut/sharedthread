/*
  Warnings:

  - You are about to drop the column `smsOptIn` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `waitlistReason` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('CLEAN', 'FLAGGED', 'UNDER_APPEAL', 'OVERRIDDEN');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AppealTargetType" AS ENUM ('POST', 'REPLY');

-- AlterTable
ALTER TABLE "discussion_posts" ADD COLUMN     "aiScore" DOUBLE PRECISION,
ADD COLUMN     "citations" JSONB,
ADD COLUMN     "hasAIFlag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasPlagiarismFlag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moderationNotes" TEXT,
ADD COLUMN     "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'CLEAN',
ADD COLUMN     "plagiarismScore" DOUBLE PRECISION,
ADD COLUMN     "qualityScore" INTEGER,
ADD COLUMN     "topics" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "discussion_replies" ADD COLUMN     "aiScore" DOUBLE PRECISION,
ADD COLUMN     "citations" JSONB,
ADD COLUMN     "hasAIFlag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasPlagiarismFlag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moderationNotes" TEXT,
ADD COLUMN     "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'CLEAN',
ADD COLUMN     "plagiarismScore" DOUBLE PRECISION,
ADD COLUMN     "qualityScore" INTEGER;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "smsOptIn",
DROP COLUMN "status",
DROP COLUMN "waitlistReason";

-- CreateTable
CREATE TABLE "moderation_appeals" (
    "id" TEXT NOT NULL,
    "targetType" "AppealTargetType" NOT NULL,
    "postId" TEXT,
    "replyId" TEXT,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "message" TEXT,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "staffUserId" TEXT,
    "staffNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moderation_appeals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "moderation_appeals" ADD CONSTRAINT "moderation_appeals_postId_fkey" FOREIGN KEY ("postId") REFERENCES "discussion_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_appeals" ADD CONSTRAINT "moderation_appeals_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "discussion_replies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_appeals" ADD CONSTRAINT "moderation_appeals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
