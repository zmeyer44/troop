import { nip19 } from "nostr-tools";
import NDK, {
  NDKEvent,
  type NostrEvent,
  NDKUser,
  type NDKSigner,
} from "@nostr-dev-kit/ndk";
import { unixTimeNowInSeconds } from "@/lib/utils/dates";

import { log } from "@/lib/utils";
export async function authEvent(ndk: NDK) {
  log("func", "authEvent");
  try {
    const pubkey = ndk.activeUser?.pubkey;
    if (!pubkey) {
      throw new Error("No public key provided!");
    }
    const eventToPublish = new NDKEvent(ndk, {
      content: "",
      tags: [
        ["u", process.env.NEXT_PUBLIC_AUTH_REQ_URL as string],
        ["method", "GET"],
      ],
      kind: 27235,
      pubkey,
      created_at: unixTimeNowInSeconds(),
    } as NostrEvent);
    await eventToPublish.sign();
    // await eventToPublish.publish();
    return eventToPublish;
  } catch (err) {
    log("error", err);
    alert("An error has occured");
    return false;
  }
}
