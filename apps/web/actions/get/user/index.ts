"use server";
import { nip19 } from "nostr-tools";
import { getProfile } from "@/actions/nostr/user/get";
import { prisma } from "@repo/database";
export async function getUser(pubkey: string) {
  let user = await prisma.user.findFirst({
    where: {
      pubkey: pubkey,
    },
  });

  if (!user) {
    user = (await getProfile(pubkey)) ?? null;
  }
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
