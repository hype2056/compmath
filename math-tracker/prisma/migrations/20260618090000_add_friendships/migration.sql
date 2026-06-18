-- Add friendCode as nullable first so existing users can be backfilled safely.
ALTER TABLE "User" ADD COLUMN "friendCode" TEXT;

-- Backfill existing users with deterministic, unique friend codes before the
-- column is made required. The row number guarantees uniqueness even in the
-- unlikely event that two hash prefixes collide.
WITH numbered_users AS (
    SELECT
        "id",
        row_number() OVER (ORDER BY "createdAt", "id") AS row_num
    FROM "User"
    WHERE "friendCode" IS NULL
)
UPDATE "User"
SET "friendCode" = 'FC-' || numbered_users.row_num || '-' || upper(substr(md5(numbered_users."id"), 1, 6))
FROM numbered_users
WHERE "User"."id" = numbered_users."id";

ALTER TABLE "User" ALTER COLUMN "friendCode" SET NOT NULL;

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "addresseeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_friendCode_key" ON "User"("friendCode");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_requesterId_addresseeId_key" ON "Friendship"("requesterId", "addresseeId");

-- CreateIndex
CREATE INDEX "Friendship_requesterId_idx" ON "Friendship"("requesterId");

-- CreateIndex
CREATE INDEX "Friendship_addresseeId_idx" ON "Friendship"("addresseeId");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
