"use server";

import { nip19 } from "nostr-tools";
import { getUserFeed } from "@/actions/nostr/feed/get";

export async function getFeed(pubkey: string) {
  return await getUserFeed(pubkey);
}
