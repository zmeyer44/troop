import { NextResponse } from "next/server";
import NDK, {
  NDKEvent,
  NDKKind,
  NDKPrivateKeySigner,
  NDKUser,
  NostrEvent,
} from "@nostr-dev-kit/ndk";
import { prisma } from "@repo/database";
import { z } from "zod";

export const maxDuration = 300;
const ProfileSchema = z.object({
  name: z.string(),
  picture: z.string().nullish(),
  about: z.string().nullish(),
  banner: z.string().nullish(),
  nip05: z.string().nullish(),
  lud16: z.string().nullish(),
  lud06: z.string().nullish(),
});

interface IParams {
  pubkey: string;
}
async function handler(req: Request, { params }: { params: IParams }) {
  const ndk = new NDK({
    outboxRelayUrls: ["wss://purplepag.es"],
    enableOutboxModel: true,
  });
  const user = ndk.getUser({
    pubkey: params.pubkey,
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
    await prisma.user.upsert({
      where: {
        pubkey: user.pubkey,
      },
      create: {
        ...dataToInsert,
      },
      update: {
        ...dataToInsert,
      },
    });

    return NextResponse.json(dataToInsert, {
      status: 200,
    });
  }

  return NextResponse.json(undefined, {
    status: 200,
  });
}

export { handler as POST };
