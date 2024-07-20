"use server";
import { SingleSigner, Aggregator, Point } from "frost-ts";

const PUBLIC_KEY =
  "17271da018f054716ebdf751916183bc9499d30646703eb6e02fa1f09dbc27ad";
const BUNKER_KEY =
  "11ad86ba850138e67658e4a8c166d38134f17f31a9991123c7cd0aa015e29228c";

export async function bunkerSign({
  eventHash,
  client_nonce_commitment_pair,
}: {
  eventHash: string;
  client_nonce_commitment_pair: [[string, string], [string, string]];
}) {
  const messageBuffer = Buffer.from(eventHash, "hex");
  const participant_indexes = [1, 2];
  const pubkey = Point.xonlyDeserialize(Buffer.from(PUBLIC_KEY, "hex"));
  const bunker = new SingleSigner(1, 2, 2, BigInt(`0x${BUNKER_KEY}`), pubkey);
  bunker.generateNoncePair();
  const bunker_nonce_commitment_pair = bunker.nonceCommitmentPair!;
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
  const [message, nonce_commitment_pairs] = agg.signingInputs();
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
