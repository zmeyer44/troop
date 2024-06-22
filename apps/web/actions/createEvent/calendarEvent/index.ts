"use server";
import {
  addCalendarEvent as addCalendarEventFunction,
  decryptData,
} from "@repo/utils";
import {
  NostrEvent,
  UnsignedEvent,
  VerifiedEvent,
  EventTemplate,
  generateSecretKey,
  getEventHash,
  getPublicKey,
  finalizeEvent,
  nip19,
} from "nostr-tools";
import { prisma } from "@repo/database";
import { unixTimeNowInSeconds } from "@/lib/utils/dates";

import { getSession } from "@/lib/auth";

export async function createCalendarEvent(event: {
  content: string;
  kind: number;
  tags: string[][];
}): Promise<UnsignedEvent>;
export async function createCalendarEvent(
  event: {
    content: string;
    kind: number;
    tags: string[][];
  },
  calendarPubkey: undefined,
): Promise<UnsignedEvent>;
export async function createCalendarEvent(
  event: { content: string; kind: number; tags: string[][] },
  calendarPubkey: string,
): Promise<VerifiedEvent>;

export async function createCalendarEvent(
  event: {
    content: string;
    kind: number;
    tags: string[][];
  },
  calendarPubkey?: string | undefined,
) {
  const currentUserSession = await getSession();
  if (!currentUserSession) throw new Error("No user session found");
  let eventTemplate = {
    ...event,
    pubkey: calendarPubkey ?? currentUserSession.user.pubkey,
    created_at: unixTimeNowInSeconds(),
  };
  if (calendarPubkey) {
    const userAuthRole = await prisma.authRole.findFirst({
      where: {
        pubkey: currentUserSession.user.pubkey,
        targetPubkey: calendarPubkey,
      },
      select: {
        target: {
          select: {
            encryptedNsec: true,
          },
        },
      },
    });
    if (!userAuthRole) throw new Error("User lacks permission");
    if (!userAuthRole.target.encryptedNsec)
      throw new Error("No secret key found");
    const [data, iv] = userAuthRole.target.encryptedNsec.split("+");
    const skData = nip19.decode(
      decryptData(iv!, data!, process.env.NSEC_ENCRYPTION_KEY as string),
    );
    if (skData.type !== "nsec") {
      throw new Error("Invalid secret key");
    }
    const sk = skData.data;
    eventTemplate = finalizeEvent(eventTemplate, sk);
  }
  return eventTemplate;
}
export async function addCalendarEvent(event: NostrEvent) {
  return addCalendarEventFunction(event);
}
