"use server";
import { encryptData } from "@repo/utils";
import {
  NostrEvent,
  EventTemplate,
  generateSecretKey,
  getEventHash,
  getPublicKey,
  finalizeEvent,
  nip19,
} from "nostr-tools";
import { prisma } from "@repo/database";
import { unixTimeNowInSeconds } from "@/lib/utils/dates";

export async function createCalendar({
  name,
  about,
  picture,
  banner,
  ownerPubkey,
}: {
  name: string;
  about: string;
  picture?: string;
  banner?: string;
  ownerPubkey: string;
}) {
  const content: {
    name: string;
    about: string;
    picture?: string;
    banner?: string;
    type: string;
  } = {
    name,
    about,
    type: "calendar",
  };
  if (picture) {
    content.picture = picture;
  }
  if (banner) {
    content.banner = banner;
  }
  const sk = generateSecretKey();
  const calendarPubkey = getPublicKey(sk);
  let eventTemplate = {
    content: JSON.stringify(content),
    pubkey: calendarPubkey,
    created_at: unixTimeNowInSeconds(),
    tags: [],
    kind: 0,
  };
  const signedEvent = finalizeEvent(eventTemplate, sk);
  await prisma.user.create({
    data: {
      pubkey: calendarPubkey,
      name,
      about,
      banner: banner,
      picture: picture,
      event: {
        create: signedEvent,
      },
      calendar: {
        create: {},
      },
    },
  });
  const nsec = nip19.nsecEncode(sk);
  const encryptedNsec = encryptData(
    nsec,
    process.env.NSEC_ENCRYPTION_KEY as string,
  );
  await prisma.authRole.create({
    data: {
      pubkey: ownerPubkey,
      role: "OWNER",
      target: {
        create: {
          pubkey: calendarPubkey,
          type: "CALENDAR",
          encryptedNsec: encryptedNsec.data + "+" + encryptedNsec.iv,
          image: picture,
        },
      },
    },
  });
  return signedEvent;
}
