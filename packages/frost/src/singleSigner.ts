import { Q, P } from "./constants";
import { Point, G } from "./point";
import { Aggregator } from "./aggregator";
import { Matrix } from "./matrix";
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

function pow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n;

  let result = 1n;
  base = base % modulus;

  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus;
    }
    exponent = exponent >> 1n;
    base = (base * base) % modulus;
  }

  return result;
}

export class SingleSigner {
  private static readonly CONTEXT = Buffer.from("FROST-BIP340");

  index: number;
  threshold: number;
  participants: number;
  secret: bigint;
  coefficient_commitment: Point;
  proof_of_knowledge: [Point, bigint] | null = null;
  nonce_pair: [bigint, bigint] | null = null;
  nonce_commitment_pair: [Point, Point] | null = null;
  public_key: Point;

  constructor(
    index: number,
    threshold: number,
    participants: number,
    secret: bigint,
    public_key: Point,
  ) {
    if (
      !Number.isInteger(index) ||
      !Number.isInteger(threshold) ||
      !Number.isInteger(participants)
    ) {
      throw new Error(
        "All arguments (index, threshold, participants) must be integers.",
      );
    }

    this.index = index;
    this.threshold = threshold;
    this.participants = participants;
    this.secret = secret;
    this.coefficient_commitment = G.multiply(secret);
    this.public_key = public_key;
  }

  init_key(): void {
    this._compute_proof_of_knowledge();
  }

  private _compute_proof_of_knowledge(): void {
    if (!this.secret) {
      throw new Error("Polynomial coefficient must be initialized.");
    }

    // k ⭠ ℤ_q
    let nonce = BigInt(`0x${crypto.randomBytes(32).toString("hex")}`) % Q;

    // R_i = g^k
    const nonce_commitment = G.multiply(nonce);

    // i
    const index_byte = Buffer.alloc(1);
    index_byte.writeUInt8(this.index);

    // 𝚽
    const context_bytes = SingleSigner.CONTEXT;
    console.log("nonce_", nonce);
    console.log("nonce_commitmentx", nonce_commitment.x);
    console.log("nonce_commitmenty", nonce_commitment.y);
    // g^a_i_0
    const secret = this.secret;
    const secret_commitment = G.multiply(secret);
    const secret_commitment_bytes = secret_commitment.sec_serialize();

    // R_i
    const nonce_commitment_bytes = nonce_commitment.sec_serialize();

    // c_i = H(i, 𝚽, g^a_i_0, R_i)
    const challenge_hash = crypto.createHash("sha256");
    challenge_hash.update(index_byte);
    challenge_hash.update(context_bytes);
    challenge_hash.update(secret_commitment_bytes);
    challenge_hash.update(nonce_commitment_bytes);
    const challenge_hash_bytes = challenge_hash.digest();
    const challenge_hash_int = BigInt(
      `0x${challenge_hash_bytes.toString("hex")}`,
    );

    // μ_i = k + a_i_0 * c_i
    const s = (nonce + secret * challenge_hash_int) % Q;

    // σ_i = (R_i, μ_i)
    this.proof_of_knowledge = [nonce_commitment, s];
  }

  verify_proof_of_knowledge(
    proof: [Point, bigint],
    secret_commitment: Point,
    index: number,
  ): boolean {
    if (proof.length !== 2) {
      throw new Error(
        "Proof must be a tuple containing exactly two elements (nonce commitment and s).",
      );
    }

    const [nonce_commitment, s] = proof;
    if (!(nonce_commitment instanceof Point) || typeof s !== "bigint") {
      throw new Error("Proof must contain a Point and a bigint.");
    }

    const index_byte = Buffer.alloc(1);
    index_byte.writeUInt8(index);
    const context_bytes = SingleSigner.CONTEXT;
    const secret_commitment_bytes = secret_commitment.sec_serialize();
    const nonce_commitment_bytes = nonce_commitment.sec_serialize();

    const challenge_input = Buffer.concat([
      index_byte,
      context_bytes,
      secret_commitment_bytes,
      nonce_commitment_bytes,
    ]);

    const challenge_hash = crypto
      .createHash("sha256")
      .update(challenge_input)
      .digest();
    const challenge_hash_int = BigInt(`0x${challenge_hash.toString("hex")}`);

    const expected_nonce_commitment = G.multiply(s).add(
      secret_commitment.multiply(Q - challenge_hash_int),
    );
    return nonce_commitment.equals(expected_nonce_commitment);
  }

  _lagrange_coefficient(
    participant_indexes: number[],
    x: bigint = 0n,
    participant_index?: bigint,
  ): bigint {
    if (new Set(participant_indexes).size !== participant_indexes.length) {
      throw new Error("Participant indexes must be unique.");
    }

    if (participant_index === undefined) {
      participant_index = BigInt(this.index);
    }

    let numerator = 1n;
    let denominator = 1n;
    for (const index of participant_indexes) {
      if (BigInt(index) === participant_index) {
        continue;
      }
      numerator = numerator * (x - BigInt(index));
      denominator = denominator * (participant_index - BigInt(index));
    }
    return (numerator * pow(denominator, Q - 2n, Q)) % Q;
  }

  generate_nonce_pair(): void {
    const nonce_pair: [bigint, bigint] = [
      BigInt(Math.floor(Math.random() * Number(Q))),
      BigInt(Math.floor(Math.random() * Number(Q))),
    ];
    const nonce_commitment_pair: [Point, Point] = [
      G.multiply(nonce_pair[0]),
      G.multiply(nonce_pair[1]),
    ];

    this.nonce_pair = nonce_pair;
    this.nonce_commitment_pair = nonce_commitment_pair;
  }

  sign(
    message: Buffer,
    nonce_commitment_pairs: [Point, Point][],
    participant_indexes: number[],
    bip32_tweak?: bigint,
    taproot_tweak?: bigint,
  ): bigint {
    if (!this.nonce_pair) {
      throw new Error("Nonce pair has not been initialized.");
    }
    if (!this.public_key) {
      throw new Error("Public key has not been initialized.");
    }
    if (!this.public_key.x || !this.public_key.y) {
      throw new Error("Public key is the point at infinity.");
    }

    const group_commitment = Aggregator.group_commitment(
      message,
      nonce_commitment_pairs,
      participant_indexes,
    );

    console.log("Group commitment:", group_commitment);

    if (group_commitment.isInfinity()) {
      throw new Error("Group commitment is the point at infinity.");
    }

    let public_key = this.public_key;
    let parity = 0;
    if (bip32_tweak !== undefined && taproot_tweak !== undefined) {
      [public_key, parity] = Aggregator.tweak_key(
        bip32_tweak,
        taproot_tweak,
        this.public_key,
      );
    }

    const challenge_hash = Aggregator.challenge_hash(
      group_commitment,
      public_key,
      message,
    );

    let [first_nonce, second_nonce] = this.nonce_pair;

    if (group_commitment.y! % 2n !== 0n) {
      first_nonce = Q - first_nonce;
      second_nonce = Q - second_nonce;
    }

    const binding_value = Aggregator.binding_value(
      this.index,
      message,
      nonce_commitment_pairs,
      participant_indexes,
    );
    const lagrange_coefficient =
      this._lagrange_coefficient(participant_indexes);
    let secret = this.secret;

    if (public_key.y === null) {
      throw new Error("Public key is the point at infinity.");
    }
    if (public_key.y % 2n !== BigInt(parity)) {
      secret = Q - secret;
    }

    return (
      (first_nonce +
        second_nonce * binding_value +
        lagrange_coefficient * secret * challenge_hash) %
      Q
    );
  }

  derive_coefficient_commitments(
    public_verification_shares: Point[],
    participant_indexes: number[],
  ): Point[] {
    if (public_verification_shares.length !== participant_indexes.length) {
      throw new Error(
        "The number of public verification shares must match the number of participant indexes.",
      );
    }

    const A = Matrix.create_vandermonde(
      participant_indexes.map((i) => BigInt(i)),
    );
    const A_inv = A.inverse_matrix();
    const Y = public_verification_shares.map((share) => [share]);
    const coefficients = A_inv.mult_point_matrix(Y);

    return coefficients.map((coeff) => coeff[0]);
  }
}
