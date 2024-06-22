"use server";
import NDK, {
  NDKEvent,
  NDKKind,
  NDKPrivateKeySigner,
  NDKUser,
  NostrEvent,
} from "@nostr-dev-kit/ndk";
import { z } from "zod";
import { sleep } from "@/lib/utils";
import { prisma } from "@repo/database";
export async function getProfile(pubkey: string) {
  console.log("Searching");
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
  const profile = await user.fetchProfile();
  if (profile && (profile.name || profile.displayName)) {
    // await db.insert(events).values(event).onConflictDoNothing();
    const dataToInsert = {
      name: profile.name ?? (profile.displayName as string),
      pubkey: user.pubkey,
      picture: profile.image,
      about: profile.about,
      banner: profile.banner,
      nip05: profile.nip05,
      lud06: profile.lud06,
      lud16: profile.lud16,
    };
    const dbUser = await prisma.user.upsert({
      where: {
        pubkey: pubkey,
      },
      create: {
        ...dataToInsert,
        pubkey: pubkey,
      },
      update: {
        ...dataToInsert,
      },
    });

    return dbUser;
  }

  return;
}
