import "@/polyfill";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import {
  Participant,
  SingleSigner,
  Aggregator,
  Point,
  G,
  Q,
} from "@repo/frost";
import { assert } from "console";
import {
  getEventHash,
  verifyEvent,
  getPublicKey,
  generateSecretKey,
} from "nostr-tools";
import { schnorr } from "@noble/curves/secp256k1";

async function handler(req: Request) {
  const p1 = new Participant(1, 2, 2);
  //   const p2 = new Participant(2, 2, 3);
  //   const p3 = new Participant(3, 2, 3);
  console.log("Initial", p1);

  // Round 1.1, 1.2, 1.3, and 1.4
  p1.init_keygen();
  console.log("Poset key gen", p1);
  const singlePubkey = p1.derive_public_key([]);
  console.log({ singlePubkey });

  //   p2.init_keygen();
  //   p3.init_keygen();

  // Round 2.1
  p1.generate_shares();
  console.log("P1 shares", p1.shares);
  const rootKey = p1.coefficients![0];
  const pubkey = G.multiply(rootKey);
  const bunkerKey = p1.coefficients![0] + p1.coefficients![1] * 1n;
  const clientKey = p1.coefficients![0] + p1.coefficients![1] * 2n;

  const nostrEvent = {
    pubkey: pubkey.xonly_serialize().toString("hex"),
    content: "test",
    kind: 1,
    created_at: 1721253848,
    tags: [],
  };
  const eventHash = getEventHash(nostrEvent);
  const messageToSign = Buffer.from(eventHash, "hex");
  const participant_indexes = [1, 2];
  const bunker = new SingleSigner(1, 2, 2, bunkerKey, pubkey);
  const client = new SingleSigner(2, 2, 2, clientKey, pubkey);
  bunker.generate_nonce_pair();
  client.generate_nonce_pair();
  const agg = new Aggregator(
    pubkey,
    messageToSign,
    [bunker.nonce_commitment_pair!, client.nonce_commitment_pair!],
    [1, 2],
  );
  console.log("agg signing_inputs");
  const [message, nonce_commitment_pairs] = agg.signing_inputs();
  console.log("Signing");

  const sBunker = bunker.sign(
    message,
    nonce_commitment_pairs,
    participant_indexes,
  );
  const sClient = client.sign(
    message,
    nonce_commitment_pairs,
    participant_indexes,
  );
  console.log("Signing Complete");

  // σ = (R, z)
  const rawSig = agg.signature([sBunker, sClient]);
  const iceBoxSig = rawSig.toString("hex");
  const rootSignature = schnorr.sign(eventHash, rootKey);
  const eventToPublish = {
    ...nostrEvent,
    id: eventHash,
    sig: uint8ArrayToHexString(rootSignature),
  };
  const validEvent = verifyEvent(eventToPublish);
  const altEvent = verifyEvent({
    ...nostrEvent,
    id: eventHash,
    sig: iceBoxSig,
  });
  const altFakeEvent = verifyEvent({
    ...nostrEvent,
    id: eventHash,
    sig: "7b9897e107163c955c998e391aade4dd966e4e0c25353b369146c47537be5e0149c41aa4822d4555d185dd79810fc796568e6e8c150e5c52508f3c0b982ffca5",
  });
  return NextResponse.json({
    eventToPublish,
    validEvent,
    iceBoxSig,
    altEvent,
    altFakeEvent,
  });

  //   p2.generate_shares();
  //   p3.generate_shares();
  //   console.log("P2 shares", p2.shares);
  //   console.log("P3 shares", p3.shares);
  // Round 2.3
  //   p1.aggregate_shares([p2.shares![p1.index - 1], p3.shares![p1.index - 1]]);
  //   console.log("Calling aggregate_shares", [
  //     p1.shares![p2.index - 1],
  //     p3.shares![p2.index - 1],
  //   ]);
  //   p2.aggregate_shares([p1.shares![p2.index - 1], p3.shares![p2.index - 1]]);
  //   p3.aggregate_shares([p1.shares![p3.index - 1], p2.shares![p3.index - 1]]);

  // Round 2.4
  //   p1.derive_public_key([
  //     p2.coefficient_commitments![0],
  //     p3.coefficient_commitments![0],
  //   ]);
  //   p2.derive_public_key([
  //     p1.coefficient_commitments![0],
  //     p3.coefficient_commitments![0],
  //   ]);
  //   p3.derive_public_key([
  //     p1.coefficient_commitments![0],
  //     p2.coefficient_commitments![0],
  //   ]);

  //   const pk1 = p1.public_key!;

  //   const pk2 = p2.public_key!;
  //   const pk3 = p3.public_key!;
  //   console.log("Public Keys:", {
  //     pk1: { x: pk1.x!.toString(), y: pk1.y!.toString() },
  //     pk2: { x: pk2.x!.toString(), y: pk2.y!.toString() },
  //     pk3: { x: pk3.x!.toString(), y: pk3.y!.toString() },
  //   });
  //   assert(pk1.equals(pk2));
  //   assert(pk1.equals(pk3));

  //   p1.derive_group_commitments([
  //     p2.coefficient_commitments!,
  //     p3.coefficient_commitments!,
  //   ]);
  //   p2.derive_group_commitments([
  //     p1.coefficient_commitments!,
  //     p3.coefficient_commitments!,
  //   ]);
  //   p3.derive_group_commitments([
  //     p1.coefficient_commitments!,
  //     p2.coefficient_commitments!,
  //   ]);

  //   // Test Sign
  //   const pk = p1.public_key!;
  //   const nostrEvent = {
  //     pubkey: pk.xonly_serialize().toString("hex"),
  //     content: "test",
  //     kind: 1,
  //     created_at: 1721253848,
  //     tags: [],
  //   };
  //   const eventHash = getEventHash(nostrEvent);
  //   const messageToSign = Buffer.from(eventHash, "hex");

  //   // NonceGen
  //   p1.generate_nonce_pair();
  //   p2.generate_nonce_pair();
  //   p3.generate_nonce_pair();
  //   const participant_indexes = [1, 2];
  //   const agg = new Aggregator(
  //     pk,
  //     messageToSign,
  //     [p1.nonce_commitment_pair!, p2.nonce_commitment_pair!],
  //     participant_indexes,
  //   );

  //   const [message, nonce_commitment_pairs] = agg.signing_inputs();
  //   const s1 = p1.sign(message, nonce_commitment_pairs, participant_indexes);
  //   const s2 = p2.sign(message, nonce_commitment_pairs, participant_indexes);

  //   // σ = (R, z)
  //   const rawSig = agg.signature([s1, s2]);
  //   const sig = rawSig.toString("hex");
  //   const eventToPublish = {
  //     ...nostrEvent,
  //     id: eventHash,
  //     sig: sig,
  //   };
  //   const validEvent = verifyEvent({
  //     ...eventToPublish,
  //     sig: sig,
  //   });

  //   const nonce_commitment = Point.xonly_deserialize(rawSig.slice(0, 32));
  //   const z = BigInt(`0x${rawSig.slice(32).toString("hex")}`);
  //   const challenge_hash = Aggregator.challenge_hash(
  //     nonce_commitment,
  //     pk,
  //     messageToSign,
  //   );
  //   let pk_to_use = pk;
  //   if (pk.y! % 2n !== 0n) {
  //     pk_to_use = pk.negate();
  //   }
  //   const left_side = nonce_commitment;
  //   const right_side = G.multiply(z).add(pk_to_use.multiply(Q - challenge_hash));

  //   return NextResponse.json({
  //     eventToPublish,
  //     validEvent,
  //     match: left_side.x === right_side.x && left_side.y === right_side.y,
  //   });
}

export { handler as GET };

function uint8ArrayToHexString(uint8Array: Uint8Array): string {
  return Array.from(uint8Array, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
