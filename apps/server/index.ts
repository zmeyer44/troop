import "websocket-polyfill";
import express, { Application, Request, Response } from "express";
import { addEvent } from "@repo/event-fetcher";
import NDK, { NDKKind } from "@nostr-dev-kit/ndk";
import { sleep, unixTimeNowInSeconds } from "@repo/utils";
import type { Event, Relay } from "nostr-tools";

async function main() {
  try {
    const app: Application = express();
    const PORT = process.env.PORT || 8080;

    app.get("/", (req: Request, res: Response) => {
      res.send("Express + TypeScript Server  ss");
    });
    const ndk = new NDK({
      outboxRelayUrls: ["wss://purplepag.es"],
      explicitRelayUrls: [
        "wss://relay.damus.io",
        "wss://nos.lol",
        "wss://nostr.wine",
        "wss://nostr.mom",
        "wss://relay.nostr.band",
      ],
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
    let eventsToProcess: Event[] = [];
    const eventStore = await ndk
      .subscribe(
        {
          kinds: [NDKKind.Metadata, 31923, 31925] as NDKKind[],
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
      if (eventsToProcess.length === 0) return;
      const event = eventsToProcess.pop();
      if (!event) return;
      await addEvent(event);
    };

    setInterval(() => {
      processLoop();
    }, 100);
    app.listen(PORT, () => {
      console.log(`Example app listening on port ${PORT}`);
    });
  } catch (err) {
    console.log("Error", err);
  }
}
main();
