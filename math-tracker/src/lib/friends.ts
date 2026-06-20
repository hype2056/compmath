import { prisma } from "@/lib/db";

export type FriendUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export type FriendshipsView = {
  accepted: { friendshipId: string; user: FriendUser }[];
  pendingIncoming: { friendshipId: string; user: FriendUser }[];
  pendingOutgoing: { friendshipId: string; user: FriendUser }[];
};

export async function getFriendUserIds(userId: string): Promise<string[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: { requesterId: true, addresseeId: true },
  });

  return friendships.map((f) => (f.requesterId === userId ? f.addresseeId : f.requesterId));
}

export async function getFriendships(userId: string): Promise<FriendshipsView> {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    include: {
      requester: { select: { id: true, name: true, email: true, image: true } },
      addressee: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const accepted: FriendshipsView["accepted"] = [];
  const pendingIncoming: FriendshipsView["pendingIncoming"] = [];
  const pendingOutgoing: FriendshipsView["pendingOutgoing"] = [];

  for (const f of friendships) {
    const isRequester = f.requesterId === userId;
    const other = isRequester ? f.addressee : f.requester;

    if (f.status === "ACCEPTED") {
      accepted.push({ friendshipId: f.id, user: other });
    } else if (isRequester) {
      pendingOutgoing.push({ friendshipId: f.id, user: other });
    } else {
      pendingIncoming.push({ friendshipId: f.id, user: other });
    }
  }

  return { accepted, pendingIncoming, pendingOutgoing };
}
