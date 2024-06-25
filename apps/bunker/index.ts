import "websocket-polyfill";
import "dotenv/config";
global.crypto = require("crypto");

import { Bunker, config } from "./bunker";
import { nip04 } from "nostr-tools";
import NDK, {
  NDKEvent,
  NDKKind,
  NDKPrivateKeySigner,
  NDKUser,
} from "@nostr-dev-kit/ndk";

async function main() {
  try {
    const encrypted = await nip04.encrypt(
      process.env.BUNKER_PRIVATE_KEY as string,
      "d82cb458b9c695a0bf577167b799d74b3dc49dfe2625e374cbc2300a9f082d5c",
      JSON.stringify({
        id: "test",
        method: "ping",
        params: [],
      }),
    );
    console.log(encrypted);
    const ndk = new NDK({
      explicitRelayUrls: config.nostr.relays,
      signer: new NDKPrivateKeySigner(process.env.BUNKER_PRIVATE_KEY),
    });
    ndk.signer?.user().then((user: NDKUser) => {
      ndk.activeUser = user;
    });
    ndk.pool?.on("relay:connecting", (relay) => {
      console.log("🪄 MAIN POOL Connecting to relay", relay.url);
    });

    ndk.pool?.on("relay:connect", (relay) => {
      console.log("✅ MAIN POOL Connected to relay", relay.url);
    });
    await ndk.connect(2000);
    const event = new NDKEvent(ndk, {
      kind: NDKKind.NostrConnect,
      pubkey: ndk.activeUser?.pubkey as string,
      content: encrypted,
      tags: [
        [
          "p",
          "d82cb458b9c695a0bf577167b799d74b3dc49dfe2625e374cbc2300a9f082d5c",
        ],
      ],
      created_at: new Date().getTime() / 1000,
    });
    event.sign();
    event.publish();
    const bunker = new Bunker(config);
    await bunker.start();
  } catch (err) {
    console.log("Error in main", err);
  }
}
main();
