"use server";
import NDK, {
  NDKEvent,
  NDKKind,
  NDKPrivateKeySigner,
  NDKUser,
  NostrEvent,
} from "@nostr-dev-kit/ndk";
import { PUBKEY } from "@/constants";
import {
  getTag,
  getTags,
  sleep,
  CalendarEventSchema,
  CalendarSchema,
  EventSchema,
} from "@repo/utils";
import { nip19 } from "nostr-tools";
import { addCalendarEvent as addCalendarEventFunction } from "@repo/utils";
import { addEvent } from "@repo/event-fetcher";

export async function getCalendarEvent(naddr: string, relays?: string[]) {
  const { data, type } = nip19.decode(naddr);
  if (type !== "naddr") {
    throw new Error("Invalid type");
  }
  const { identifier, kind, pubkey } = data;
  const ndk = new NDK({
    outboxRelayUrls: ["wss://purplepag.es"],
    explicitRelayUrls: relays ?? [
      "wss://relay.damus.io",
      "wss://nos.lol",
      "wss://nostr.wine",
      "wss://nostr.mom",
      "wss://relay.nostr.band",
    ],
    enableOutboxModel: true,
  });
  const user = ndk.getUser({
    pubkey: PUBKEY,
  });
  ndk.pool?.on("relay:connecting", (relay) => {
    console.log("🪄 MAIN POOL Connecting to relay", relay.url);
  });

  ndk.pool?.on("relay:connect", (relay) => {
    console.log("✅ MAIN POOL Connected to relay", relay.url);
  });
  ndk.activeUser = user;
  ndk.activeUser = user;
  await ndk.connect(2000);
  await sleep(5_000);
  const event = await ndk.fetchEvent(
    {
      kinds: [kind as NDKKind],
      authors: [pubkey],
      ["#d"]: [identifier],
    },
    { subId: "calendar-event" },
  );
  console.log("Found", event);
  if (event) {
    const rawEvent = event.rawEvent();
    return await addEvent(rawEvent);
  }
}
