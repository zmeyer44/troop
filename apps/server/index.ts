import "websocket-polyfill";
import express, { Application, Request, Response } from "express";
import { addEvent } from "@repo/event-fetcher";
import NDK, {
  NDKKind,
  NDKEvent,
  NDKUser,
  NDKTag,
  NDKPrivateKeySigner,
} from "@nostr-dev-kit/ndk";
import { sleep, unixTimeNowInSeconds } from "@repo/utils";
import type { Event, Relay } from "nostr-tools";
import { nip19 } from "nostr-tools";
import { repeatEvent } from "./src/repeater";
import axios from "axios";
const RELAYS = [
  "wss://relay.nostr.band",
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://nostr.wine",
  "wss://nostr.mom",
  "wss://e.nos.lol",
  "wss://relay.primal.net",
];

async function main() {
  try {
    const app: Application = express();
    const PORT = process.env.PORT || 8080;

    const keyMasterPrivateKey = process.env.KEY_MASTER_PRIVATE_KEY as string;
    const keyMaster = new NDKPrivateKeySigner(keyMasterPrivateKey);
    const keyMasterPubkey = (await keyMaster.user()).pubkey;
    console.log("keyMasterPubkey", keyMasterPubkey);

    app.get("/", (req: Request, res: Response) => {
      res.send("Express + TypeScript Server  ss");
    });
    const ndk = new NDK({
      outboxRelayUrls: ["wss://purplepag.es"],
      explicitRelayUrls: RELAYS,
      enableOutboxModel: false,
    });
    const user = ndk.getUser({
      npub: "npub1zach44xjpc4yyhx6pgse2cj2pf98838kja03dv2e8ly8lfr094vqvm5dy5",
    });

    ndk.pool?.on("relay:connecting", (relay) => {
      console.log("🪄 MAIN POOL Connecting to relay", relay.url);
    });

    ndk.pool?.on("relay:connect", (relay) => {
      console.log("✅ MAIN POOL Connected to relay", relay.url);
    });
    ndk.activeUser = user;
    await ndk.connect(2000);
    await sleep(5_000);
    const eventIds = new Set();
    const brokerEventIds = new Set();
    let eventsToProcess: Event[] = [];
    let keyMasterEventsToProcess: Event[] = [];
    let brokerEventsToProcess: Event[] = [];
    const eventStore = await ndk
      .subscribe(
        {
          kinds: [31923 as NDKKind, 31925] as NDKKind[],
          since: unixTimeNowInSeconds() - 5 * 60,
        },
        { closeOnEose: false },
      )
      .on("event", (event) => {
        console.log(
          `received event`,
          event?.kind,
          event.pubkey,
          event.id,
          event.content,
        );
        if (event) {
          onSaveEvent(event, event?.relay?.url);
        }
      });
    const brokerStore = await ndk
      .subscribe(
        {
          since: unixTimeNowInSeconds() - 5 * 60,
          authors: [process.env.LISTEN_PUBKEY as string],
          kinds: [1, 7, 5],
        },
        { closeOnEose: false },
      )
      .on("event", (event) => {
        console.log(
          `Broker received event`,
          event?.kind,
          event.pubkey,
          event.id,
          event.content,
        );
        if (event) {
          onBrokerEvent(event, event?.relay?.url);
        }
      });
    console.log("subscribe", {
      kinds: [1] as NDKKind[],
      ["#p"]: [keyMasterPubkey],
      since: unixTimeNowInSeconds() - 5 * 60,
    });
    const keysStore = await ndk
      .subscribe(
        {
          kinds: [1] as NDKKind[],
          ["#p"]: [keyMasterPubkey],
          since: unixTimeNowInSeconds() - 5 * 60,
        },
        { closeOnEose: false },
      )
      .on("event", (event) => {
        console.log(
          `Key master mentioned`,
          event?.kind,
          event.pubkey,
          event.id,
          event.content,
        );
        if (event) {
          onKeyMasterMention(event, event?.relay?.url);
        }
      });

    async function onKeyMasterMention(event: Event, relay?: Relay) {
      console.log(`Received event ${event.id} from ${relay}`);
      if (eventIds.has(event.id)) return;
      const isMention = event.tags.find(
        (t) => t[1] === keyMasterPubkey && t[3] === "mention",
      );
      if (!isMention) return;
      eventIds.add(event.id);
      const normalizedEvent: Event = {
        id: event.id,
        pubkey: event.pubkey,
        created_at: event.created_at,
        kind: event.kind,
        tags: event.tags,
        content: event.content,
        sig: event.sig,
      };
      keyMasterEventsToProcess.push(normalizedEvent);
    }

    async function onSaveEvent(event: Event, relay?: Relay) {
      console.log(`Received event ${event.id} from ${relay}`);
      if (eventIds.has(event.id)) return;
      eventIds.add(event.id);
      const normalizedEvent: Event = {
        id: event.id,
        pubkey: event.pubkey,
        created_at: event.created_at,
        kind: event.kind,
        tags: event.tags,
        content: event.content,
        sig: event.sig,
      };
      eventsToProcess.push(normalizedEvent);
    }

    const processLoop = async () => {
      try {
        if (eventsToProcess.length === 0) return;
        const event = eventsToProcess.pop();
        if (!event) return;
        await addEvent(event);
      } catch (err) {
        console.error("processLoop error", JSON.stringify(err));
      }
    };

    const processBrokerLoop = async () => {
      try {
        if (brokerEventsToProcess.length === 0) return;
        console.log("processBrokerLoop Found");
        const event = brokerEventsToProcess.pop();
        if (!event) return;
        const eventToPublish = await repeatEvent(event);
        if (eventToPublish) {
          const newEvent = new NDKEvent(ndk, eventToPublish);
          console.log("Publishing");
          newEvent.publish();
        }
      } catch (err) {
        console.error("processLoop error", JSON.stringify(err));
      }
    };

    const KEY_ALLOCATION_URL = process.env.KEY_ALLOCATION_URL as string;
    const processKeyMasterLoop = async () => {
      try {
        await ndk.connect();
        console.log("ndk", ndk);
        if (keyMasterEventsToProcess.length === 0) return;
        console.log("processKeyMasterLoop Found");
        const event = keyMasterEventsToProcess.pop();
        if (!event) return;
        console.log("Event", event);
        const user = new NDKUser({
          pubkey: event.pubkey,
        });
        console.log("user", user);
        const userProfile = await user.fetchProfile();
        console.log("userProfile", userProfile);
        const amount = Math.floor(Math.random() * 10) + 1;
        const npub = nip19.npubEncode(event.pubkey);
        const body = {
          userReference: event.pubkey,
          userUsername: userProfile?.name ?? npub,
          userPfp: userProfile?.image ?? userProfile?.banner,
          userDisplayName: userProfile?.displayName,
          amount: amount,
          notes: `Event ref: ${event.id}`,
        };
        console.log("Body", body);
        const response = await axios.post(KEY_ALLOCATION_URL, body, {
          headers: { "Content-Type": "application/json" },
        });
        console.log("Response", response);
        const tags: NDKTag[] = [
          ["e", event.id, "", "root"],
          ["p", event.pubkey],
        ];
        const newEvent = new NDKEvent(ndk, {
          content: `You have been awarded ${amount} keys 🔑`,
          pubkey: keyMasterPubkey,
          created_at: unixTimeNowInSeconds(),
          tags: tags,
          kind: 1,
        });
        newEvent.sign(keyMaster);
        newEvent.publish();
      } catch (err) {
        console.error("processKeyMasterLoop error", JSON.stringify(err));
      }
    };

    setInterval(() => {
      processLoop();
      processBrokerLoop();
      processKeyMasterLoop();
    }, 100);
    app.listen(PORT, () => {
      console.log(`Example app listening on port ${PORT}`);
    });

    async function onBrokerEvent(event: Event, relay?: Relay) {
      console.log(`Received event ${event.id} from ${relay}`);
      if (brokerEventIds.has(event.id)) return;
      brokerEventIds.add(event.id);
      const normalizedEvent: Event = {
        id: event.id,
        pubkey: event.pubkey,
        created_at: event.created_at,
        kind: event.kind,
        tags: event.tags,
        content: event.content,
        sig: event.sig,
      };
      console.log("Adding to brokerEventsToProcess", normalizedEvent);
      brokerEventsToProcess.push(normalizedEvent);
    }
  } catch (err) {
    console.log("Error in main", err);
  }
}
main();
