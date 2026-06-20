"use client";

import { useState, useTransition } from "react";
import {
  acceptFriendRequest,
  declineFriendRequest,
  sendFriendRequest,
} from "@/app/dashboard/friends/actions";
import type { FriendshipsView } from "@/lib/friends";

type Props = {
  friendships: FriendshipsView;
};

export function FriendManager({ friendships }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await sendFriendRequest(email);
        setEmail("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function handleAccept(friendshipId: string) {
    setError(null);
    startTransition(async () => {
      try {
        await acceptFriendRequest(friendshipId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function handleDecline(friendshipId: string) {
    setError(null);
    startTransition(async () => {
      try {
        await declineFriendRequest(friendshipId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-ink/15 bg-paper p-5 space-y-5">
      <div>
        <h2 className="font-serif font-semibold text-ink">Friends</h2>
        <p className="text-sm text-ink/60 mt-1">
          Invite friends by the email they used to sign in.
        </p>
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@example.com"
          required
          className="flex-1 rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-ink px-4 py-2 text-sm text-paper font-medium disabled:opacity-50"
        >
          Invite
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {friendships.pendingIncoming.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wide text-ink/50 mb-2">Incoming requests</h3>
          <ul className="space-y-2">
            {friendships.pendingIncoming.map(({ friendshipId, user }) => (
              <li
                key={friendshipId}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-ink">{user.name ?? user.email}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAccept(friendshipId)}
                    disabled={isPending}
                    className="text-green-700 hover:underline disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(friendshipId)}
                    disabled={isPending}
                    className="text-ink/50 hover:underline disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {friendships.pendingOutgoing.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wide text-ink/50 mb-2">Pending invites</h3>
          <ul className="space-y-1">
            {friendships.pendingOutgoing.map(({ friendshipId, user }) => (
              <li key={friendshipId} className="text-sm text-ink/60">
                {user.name ?? user.email} — waiting
              </li>
            ))}
          </ul>
        </div>
      )}

      {friendships.accepted.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wide text-ink/50 mb-2">
            Your friends ({friendships.accepted.length})
          </h3>
          <ul className="space-y-1">
            {friendships.accepted.map(({ friendshipId, user }) => (
              <li key={friendshipId} className="text-sm text-ink">
                {user.name ?? user.email}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
