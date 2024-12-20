import { getEventHash, verifyEvent, Event } from "nostr-tools";
import { SingleSigner, Point, Aggregator } from "frost-ts";
import { z } from "zod";
import axios from "axios";
const BUNKER_URL = "https://www.troop.is/api/bunker/sign";

const BunkerResponseSchema = z.object({
  bunkerSignature: z.string(),
  bunkerNonceCommitmentPair: z.tuple([
    z.tuple([z.string(), z.string()]),
    z.tuple([z.string(), z.string()]),
  ]),
});

export async function repeatEvent(rawEvent: Event) {
  const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
  const TARGET_PUBKEY = process.env.TARGET_PUBKEY as string;
  const clientKey = BigInt(`0x${CLIENT_SECRET}`);
  const participantIndexes = [1, 2];
  const nostrEvent = {
    pubkey: TARGET_PUBKEY,
    content: rawEvent.content,
    kind: rawEvent.kind,
    created_at: rawEvent.created_at,
    tags: rawEvent.tags,
  };
  const eventHash = getEventHash(nostrEvent);
  const messageBuffer = Buffer.from(eventHash, "hex");
  const pubkey = Point.xonlyDeserialize(Buffer.from(TARGET_PUBKEY, "hex"));
  const client = new SingleSigner(2, 2, 2, clientKey, pubkey);
  client.generateNoncePair();
  const clientNonceCommitmentPair = client.nonceCommitmentPair!.map((c) => [
    c.x!.toString(16),
    c.y!.toString(16),
  ]) as [[string, string], [string, string]];
  const body = {
    eventHash: eventHash,
    clientNonceCommitmentPair: clientNonceCommitmentPair,
  };
  const response = await axios.post(BUNKER_URL, body, {
    headers: { "Content-Type": "application/json" },
  });

  const bunkerSignaturePart = BunkerResponseSchema.parse(response.data);

  const agg = new Aggregator(
    pubkey,
    messageBuffer,
    [
      bunkerSignaturePart.bunkerNonceCommitmentPair.map(
        ([x, y]) => new Point(BigInt(`0x${x}`), BigInt(`0x${y}`)),
      ) as [Point, Point],
      client.nonceCommitmentPair!,
    ],
    participantIndexes,
  );
  const [message, nonceCommitmentPairs] = agg.signingInputs();
  const sClient = client.sign(
    message,
    nonceCommitmentPairs,
    participantIndexes,
  );

  const rawSig = agg.signature([
    BigInt(`0x${bunkerSignaturePart.bunkerSignature}`),
    sClient,
  ]);
  const hexSig = rawSig.toString("hex");
  const eventToPublish = {
    ...nostrEvent,
    id: eventHash,
    sig: hexSig,
  };
  console.log("Event to publish", eventToPublish);
  const validEvent = verifyEvent(eventToPublish);
  console.log("IS valid", validEvent);
  if (validEvent) {
    // Publish the event
    return eventToPublish;
  }
  return;
}
