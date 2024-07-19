"use server";
import { SingleSigner, Aggregator, Point } from "@repo/frost";

const PUBLIC_KEY = "";
const BUNKER_KEY = "";

export async function bunkerSign({
  eventHash,
  client_nonce_commitment_pair,
}: {
  eventHash: string;
  client_nonce_commitment_pair: [[string, string], [string, string]];
}) {
  const messageBuffer = Buffer.from(eventHash, "hex");
  const participant_indexes = [1, 2];
  const pubkey = Point.xonly_deserialize(Buffer.from(PUBLIC_KEY, "hex"));
  const bunker = new SingleSigner(1, 2, 2, BigInt(`0x${BUNKER_KEY}`), pubkey);
  bunker.generate_nonce_pair();
  const bunker_nonce_commitment_pair = bunker.nonce_commitment_pair!;
  const agg = new Aggregator(
    pubkey,
    messageBuffer,
    [
      bunker_nonce_commitment_pair,
      client_nonce_commitment_pair.map(
        ([x, y]) => new Point(BigInt(`0x${x}`), BigInt(`0x${y}`)),
      ) as [Point, Point],
    ],
    participant_indexes,
  );
  const [message, nonce_commitment_pairs] = agg.signing_inputs();
  const sBunker = bunker.sign(
    message,
    nonce_commitment_pairs,
    participant_indexes,
  );
  return {
    bunker_signature: sBunker.toString(16),
    bunker_nonce_commitment_pair: bunker_nonce_commitment_pair.map((c) => [
      c.x!.toString(16),
      c.y!.toString(16),
    ]) as [[string, string], [string, string]],
  };
}
