"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function revalidateLeaderboard() {
  revalidatePath("/dashboard/leaderboard");
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be signed in.");
  }
  return session.user.id;
}

async function existingFriendship(userA: string, userB: string) {
  return prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userA, addresseeId: userB },
        { requesterId: userB, addresseeId: userA },
      ],
    },
  });
}

export async function sendFriendRequest(email: string) {
  const userId = await requireUserId();
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    throw new Error("Enter a friend's email address.");
  }

  const target = await prisma.user.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
  });
  if (!target) {
    throw new Error("No user found with that email. They need to sign in first.");
  }
  if (target.id === userId) {
    throw new Error("You can't add yourself.");
  }

  const existing = await existingFriendship(userId, target.id);
  if (existing) {
    if (existing.status === "ACCEPTED") {
      throw new Error("You're already friends.");
    }
    throw new Error("A friend request is already pending.");
  }

  await prisma.friendship.create({
    data: {
      requesterId: userId,
      addresseeId: target.id,
    },
  });

  revalidateLeaderboard();
}

export async function acceptFriendRequest(friendshipId: string) {
  const userId = await requireUserId();

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship || friendship.addresseeId !== userId) {
    throw new Error("Friend request not found.");
  }
  if (friendship.status !== "PENDING") {
    throw new Error("This request is no longer pending.");
  }

  await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: "ACCEPTED" },
  });

  revalidateLeaderboard();
}

export async function declineFriendRequest(friendshipId: string) {
  const userId = await requireUserId();

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship || friendship.addresseeId !== userId) {
    throw new Error("Friend request not found.");
  }
  if (friendship.status !== "PENDING") {
    throw new Error("This request is no longer pending.");
  }

  await prisma.friendship.delete({ where: { id: friendshipId } });

  revalidateLeaderboard();
}
