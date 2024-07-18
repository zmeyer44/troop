import { Point, G } from "./point";
import { Q } from "./constants";
import * as cryptoT from "crypto";
let crypto: typeof cryptoT;

if (
  typeof process !== "undefined" &&
  process.versions &&
  process.versions.node
) {
  // Node.js environment detected
  crypto = require("crypto");
} else {
  // Browser environment, or crypto is already available globally
  crypto = cryptoT;
}

function sha256(data?: string) {
  if (data !== undefined) {
    return crypto.createHash("sha256").update(data);
  }
  return crypto.createHash("sha256");
}

export class Aggregator {
  public_key: Point;
  message: Buffer;
  nonce_commitment_pairs: [Point, Point][];
  participant_indexes: number[];
  tweaked_key: Point | null;
  tweak: bigint | null;

  constructor(
    public_key: Point,
    message: Buffer,
    nonce_commitment_pairs: [Point, Point][],
    participant_indexes: number[],
    bip32_tweak?: bigint,
    taproot_tweak?: bigint,
  ) {
    this.public_key = public_key;
    this.message = message;
    this.nonce_commitment_pairs = nonce_commitment_pairs;
    this.participant_indexes = participant_indexes;

    this.tweaked_key = null;
    this.tweak = null;

    if ((bip32_tweak === undefined) !== (taproot_tweak === undefined)) {
      throw new Error(
        "Both bip32_tweak and taproot_tweak must be provided together, or neither.",
      );
    }

    if (bip32_tweak !== undefined && taproot_tweak !== undefined) {
      const [tweaked_key, tweak] = Aggregator._compute_tweaks(
        bip32_tweak,
        taproot_tweak,
        public_key,
      );
      this.tweaked_key = tweaked_key;
      this.tweak = tweak;
    }
  }

  static tweak_key(
    bip32_tweak: bigint,
    taproot_tweak: bigint,
    public_key: Point,
  ): [Point, number] {
    const [tweaked_key, _, p] = Aggregator._compute_tweaks(
      bip32_tweak,
      taproot_tweak,
      public_key,
    );
    return [tweaked_key, Number(p)];
  }

  static group_commitment(
    message: Buffer,
    nonce_commitment_pairs: [Point, Point][],
    participant_indexes: number[],
  ): Point {
    let group_commitment = new Point(null, null); // Point at infinity

    for (const index of participant_indexes) {
      if (index < 1 || index > nonce_commitment_pairs.length) {
        throw new Error(`Participant index ${index} is out of range.`);
      }

      const binding_value = Aggregator.binding_value(
        index,
        message,
        nonce_commitment_pairs,
        participant_indexes,
      );

      console.log(`Binding value for index ${index}:`, binding_value);

      const [first_commitment, second_commitment] =
        nonce_commitment_pairs[index - 1];

      console.log(`First commitment for index ${index}:`, first_commitment);
      console.log(`Second commitment for index ${index}:`, second_commitment);

      const partial_commitment = first_commitment.add(
        second_commitment.multiply(binding_value),
      );
      group_commitment = group_commitment.add(partial_commitment);

      console.log(`Intermediate group commitment:`, group_commitment);
    }

    if (group_commitment.isInfinity()) {
      throw new Error("Resulting group commitment is the point at infinity");
    }

    return group_commitment;
  }

  static binding_value(
    index: number,
    message: Buffer,
    nonce_commitment_pairs: [Point, Point][],
    participant_indexes: number[],
  ): bigint {
    if (index < 1) {
      throw new Error("Participant index must start from 1.");
    }

    const binding_value = sha256();
    const index_byte = Buffer.alloc(1);
    index_byte.writeUInt8(index);

    const nonce_commitment_pairs_bytes: Buffer[] = [];
    for (const idx of participant_indexes) {
      if (idx < 1 || idx > nonce_commitment_pairs.length) {
        throw new Error(`Index ${idx} is out of range for nonce commitments.`);
      }
      const participant_pair = nonce_commitment_pairs[idx - 1];
      const participant_pair_bytes = Buffer.concat(
        participant_pair.map((commitment) => commitment.sec_serialize()),
      );
      nonce_commitment_pairs_bytes.push(participant_pair_bytes);
    }

    binding_value.update(index_byte);
    binding_value.update(message);
    binding_value.update(Buffer.concat(nonce_commitment_pairs_bytes));
    const binding_value_bytes = binding_value.digest();

    return BigInt(`0x${binding_value_bytes.toString("hex")}`) % Q;
  }

  static challenge_hash(
    nonce_commitment: Point,
    public_key: Point,
    message: Buffer,
  ): bigint {
    const tag_hash = crypto
      .createHash("sha256")
      .update("BIP0340/challenge")
      .digest();
    const challenge_hash = crypto
      .createHash("sha256")
      .update(tag_hash)
      .update(tag_hash)
      .update(nonce_commitment.xonly_serialize())
      .update(public_key.xonly_serialize())
      .update(message)
      .digest();

    return BigInt(`0x${challenge_hash.toString("hex")}`) % Q;
  }

  signing_inputs(): [Buffer, [Point, Point][]] {
    return [this.message, this.nonce_commitment_pairs];
  }

  signature(signature_shares: bigint[]): Buffer {
    // Log the signature shares
    console.log(
      "Signature shares:",
      signature_shares.map((s) => s.toString()),
    );

    const group_commitment = Aggregator.group_commitment(
      this.message,
      this.nonce_commitment_pairs,
      this.participant_indexes,
    );

    // Log the group commitment
    console.log("Group commitment:", group_commitment.toString());

    let z = signature_shares.reduce((sum, share) => (sum + share) % Q, 0n);
    if (z < 0n) {
      z = (z + Q) % Q;
    }
    // Log z before any adjustments
    console.log("z before adjustment:", z.toString());

    if (this.tweak !== null && this.tweaked_key !== null) {
      const challenge_hash = Aggregator.challenge_hash(
        group_commitment,
        this.tweaked_key,
        this.message,
      );
      z = (z + challenge_hash * this.tweak) % Q;
    }

    const nonce_commitment_buffer = group_commitment.xonly_serialize();
    const z_buffer = Buffer.alloc(32);
    const zHex = z.toString(16).padStart(64, "0");
    z_buffer.write(zHex, 0, "hex");

    console.log(
      "Nonce commitment in signature:",
      nonce_commitment_buffer.toString("hex"),
    );
    console.log("z in signature:", z_buffer.toString("hex"));

    return Buffer.concat([nonce_commitment_buffer, z_buffer]);
  }

  private static _compute_tweaks(
    bip32_tweak: bigint,
    taproot_tweak: bigint,
    public_key: Point,
  ): [Point, bigint, number] {
    const bip32_key = public_key.add(G.multiply(bip32_tweak));
    if (bip32_key.y === null) {
      throw new Error("Invalid public key.");
    }
    const is_bip32_key_odd = bip32_key.y % 2n !== 0n;
    const adjusted_bip32_key = is_bip32_key_odd
      ? bip32_key.negate()
      : bip32_key;
    const bip32_parity = is_bip32_key_odd ? 1 : 0;
    const adjusted_bip32_tweak = is_bip32_key_odd ? -bip32_tweak : bip32_tweak;

    const aggregate_key = adjusted_bip32_key.add(G.multiply(taproot_tweak));
    if (aggregate_key.y === null) {
      throw new Error("Invalid public key.");
    }
    const aggregate_tweak = (adjusted_bip32_tweak + taproot_tweak) % Q;
    const adjusted_aggregate_tweak =
      aggregate_key.y % 2n !== 0n
        ? (-aggregate_tweak + Q) % Q
        : aggregate_tweak;

    return [aggregate_key, adjusted_aggregate_tweak, bip32_parity];
  }
}
