"use server";
import { SingleSigner, Aggregator, Point } from "frost-ts";

export async function bunkerSign({
  eventHash,
  clientNonceCommitmentPair,
}: {
  eventHash: string;
  clientNonceCommitmentPair: [[string, string], [string, string]];
}) {
  const BUNKER_KEY = process.env.BUNKER_KEY as string;
  const PUBLIC_KEY = process.env.BUNKER_TARGET_PUBLIC_KEY as string;
  const messageBuffer = Buffer.from(eventHash, "hex");
  const participantIndexes = [1, 2];
  const pubkey = Point.xonlyDeserialize(Buffer.from(PUBLIC_KEY, "hex"));
  const bunker = new SingleSigner(1, 2, 2, BigInt(`0x${BUNKER_KEY}`), pubkey);
  bunker.generateNoncePair();
  const bunkerNonceCommitmentPair = bunker.nonceCommitmentPair!;
  const agg = new Aggregator(
    pubkey,
    messageBuffer,
    [
      bunkerNonceCommitmentPair,
      clientNonceCommitmentPair.map(
        ([x, y]) => new Point(BigInt(`0x${x}`), BigInt(`0x${y}`)),
      ) as [Point, Point],
    ],
    participantIndexes,
  );
  const [message, nonceCommitmentPairs] = agg.signingInputs();
  const sBunker = bunker.sign(
    message,
    nonceCommitmentPairs,
    participantIndexes,
  );
  return {
    bunkerSignature: bigIntToHex(sBunker),
    bunkerNonceCommitmentPair: bunkerNonceCommitmentPair.map((c) => [
      c.x!.toString(16),
      c.y!.toString(16),
    ]) as [[string, string], [string, string]],
  };
}

function bigIntToHex(bigIntValue: bigint): string {
  if (bigIntValue >= 0n) {
    return bigIntValue.toString(16);
  } else {
    // For negative numbers, we need to use two's complement
    const bits = bigIntValue.toString(2).length;
    const maxBigInt = 2n ** BigInt(bits) - 1n;
    return ((maxBigInt + bigIntValue + 1n) & maxBigInt).toString(16);
  }
}
