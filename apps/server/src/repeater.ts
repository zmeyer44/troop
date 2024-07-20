import { NostrEvent } from "@nostr-dev-kit/ndk";
import { getEventHash, verifyEvent, Event } from "nostr-tools";
import { SingleSigner, Point, Aggregator } from "frost-ts";

const TARGET_PUBKEY =
  "1b5c7f2f8a8f7e7ea7775879fd02d098db6ec588114521f1a1edfccd635c1fe9";
const CLIENT_SECRET =
  "26a83c8c246132b27f3f6a600dbd27bf76bb1e3ce8dba844018d540dba4fef41";

export async function repeatEvent(rawEvent: Event) {
  const BUNKER_SECRET = process.env.BUNKER_SECRET;
  const participant_indexes = [1, 2];
  const clientKey = BigInt(`0x${CLIENT_SECRET}`);
  const bunkerKey = BigInt(`0x${BUNKER_SECRET}`);
  const pubkey = Point.xonlyDeserialize(Buffer.from(TARGET_PUBKEY, "hex"));
  const bunker = new SingleSigner(1, 2, 2, bunkerKey, pubkey);
  const client = new SingleSigner(2, 2, 2, clientKey, pubkey);
  const nostrEvent = {
    pubkey: TARGET_PUBKEY,
    content: rawEvent.content,
    kind: rawEvent.kind,
    created_at: rawEvent.created_at,
    tags: rawEvent.tags,
  };
  const eventHash = getEventHash(nostrEvent);
  const messageToSign = Buffer.from(eventHash, "hex");
  bunker.generateNoncePair();
  client.generateNoncePair();
  const agg = new Aggregator(
    pubkey,
    messageToSign,
    [bunker.nonceCommitmentPair!, client.nonceCommitmentPair!],
    participant_indexes,
  );
  const [message, nonceCommitmentPairs] = agg.signingInputs();
  const sBunker = bunker.sign(
    message,
    nonceCommitmentPairs,
    participant_indexes,
  );
  const sClient = client.sign(
    message,
    nonceCommitmentPairs,
    participant_indexes,
  );

  // σ = (R, z)
  const rawSig = agg.signature([sBunker, sClient]);
  const iceBoxSig = rawSig.toString("hex");
  const eventToPublish = {
    ...nostrEvent,
    id: eventHash,
    sig: iceBoxSig,
  };
  const validEvent = verifyEvent(eventToPublish);
  if (validEvent) {
    // Publish the event
    return eventToPublish;
  }
  return;
}
