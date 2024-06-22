"use server";
import NDK, {
  NDKEvent,
  NDKKind,
  NDKPrivateKeySigner,
  NDKUser,
  NostrEvent,
} from "@nostr-dev-kit/ndk";
import { sleep } from "@repo/utils";
import { prisma } from "@repo/database";
import { unixTimeNowInSeconds } from "@/lib/utils/dates";
export async function getUserFeed(pubkey: string) {
  const ndk = new NDK({
    outboxRelayUrls: ["wss://purplepag.es"],
    enableOutboxModel: true,
  });
  const user = ndk.getUser({
    pubkey: pubkey,
  });
  ndk.pool?.on("relay:connecting", (relay) => {
    console.log("🪄 MAIN POOL Connecting to relay", relay.url);
  });

  ndk.pool?.on("relay:connect", (relay) => {
    console.log("✅ MAIN POOL Connected to relay", relay.url);
  });
  ndk.activeUser = user;
  await ndk.connect(2000);
  let follows: Set<NDKUser> = new Set();
  follows = await user.follows(undefined, true);
  await sleep(6_000);
  const feed = await ndk.fetchEvents(
    {
      kinds: [1],
      authors: Array.from(follows)
        .slice(0, 20000)
        .map((u) => u.pubkey),
    },
    { subId: "feed" },
  );

  return await prisma.event.createMany({
    data: Array.from(feed).map((e) => ({
      created_at: e.created_at ?? unixTimeNowInSeconds(),
      id: e.id,
      kind: e.kind ?? 1,
      pubkey: e.pubkey,
      sig: e.sig ?? "",
      content: e.content,
      tags: e.tags,
    })),
  });
}
