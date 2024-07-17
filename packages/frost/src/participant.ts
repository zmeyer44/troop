import { Q } from "./constants";
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

function sha256(data?: Buffer) {
  if (data !== undefined) {
    return crypto.createHash("sha256").update(data);
  }
  return crypto.createHash("sha256");
}

export class Participant {
  private static readonly CONTEXT = Buffer.from("FROST-BIP340");

  index: number;
  threshold: number;
  participants: number;
  coefficients: bigint[] | null = null;
  coefficient_commitments: Point[] | null = null;
  proof_of_knowledge: [Point, bigint] | null = null;
  shares: bigint[] | null = null;
  aggregate_share: bigint | null = null;
  nonce_pair: [bigint, bigint] | null = null;
  nonce_commitment_pair: [Point, Point] | null = null;
  public_key: Point | null = null;
  repair_shares: (bigint | null)[] | null = null;
  aggregate_repair_share: bigint | null = null;
  repair_share_commitments: (Point | null)[] | null = null;
  group_commitments: Point[] | null = null;
  repair_participants: number[] | null = null;

  constructor(index: number, threshold: number, participants: number) {
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
  }

  init_keygen(): void {
    this._generate_polynomial();
    this._compute_proof_of_knowledge();
    this._compute_coefficient_commitments();
  }

  init_refresh(): void {
    this._generate_refresh_polynomial();
    this._compute_coefficient_commitments();
  }

  init_threshold_increase(new_threshold: number): void {
    if (!Number.isInteger(new_threshold)) {
      throw new Error("New threshold must be an integer.");
    }
    if (new_threshold <= this.threshold) {
      throw new Error(
        "New threshold must be greater than the current threshold.",
      );
    }

    this._generate_threshold_increase_polynomial(new_threshold);
    this._compute_proof_of_knowledge();
    this._compute_coefficient_commitments();

    this.threshold = new_threshold;
  }

  private _generate_polynomial(): void {
    this.coefficients = Array.from({ length: this.threshold }, () =>
      BigInt(Math.floor(Math.random() * Number(Q))),
    );
  }

  private _generate_refresh_polynomial(): void {
    this.coefficients = [
      0n,
      ...Array.from({ length: this.threshold - 1 }, () =>
        BigInt(Math.floor(Math.random() * Number(Q))),
      ),
    ];
  }

  private _generate_threshold_increase_polynomial(new_threshold: number): void {
    this.coefficients = Array.from({ length: new_threshold - 1 }, () =>
      BigInt(Math.floor(Math.random() * Number(Q))),
    );
  }

  private _compute_proof_of_knowledge(): void {
    if (!this.coefficients) {
      throw new Error("Polynomial coefficients must be initialized.");
    }

    const nonce = BigInt(Math.floor(Math.random() * Number(Q)));
    const nonce_commitment = G.multiply(nonce);
    const index_byte = Buffer.alloc(1);
    index_byte.writeUInt8(this.index);
    const context_bytes = Participant.CONTEXT;
    const secret = this.coefficients[0];
    const secret_commitment = G.multiply(secret);
    const secret_commitment_bytes = secret_commitment.sec_serialize();
    const nonce_commitment_bytes = nonce_commitment.sec_serialize();

    const challenge_hash = sha256();
    challenge_hash.update(index_byte);
    challenge_hash.update(context_bytes);
    challenge_hash.update(secret_commitment_bytes);
    challenge_hash.update(nonce_commitment_bytes);
    const challenge_hash_bytes = challenge_hash.digest();
    const challenge_hash_int = BigInt(
      `0x${challenge_hash_bytes.toString("hex")}`,
    );

    const s = (nonce + secret * challenge_hash_int) % Q;
    this.proof_of_knowledge = [nonce_commitment, s];
  }

  private _compute_coefficient_commitments(): void {
    if (!this.coefficients) {
      throw new Error("Polynomial coefficients must be initialized.");
    }

    this.coefficient_commitments = this.coefficients.map((coefficient) =>
      G.multiply(coefficient),
    );
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
    const context_bytes = Participant.CONTEXT;
    const secret_commitment_bytes = secret_commitment.sec_serialize();
    const nonce_commitment_bytes = nonce_commitment.sec_serialize();

    const challenge_input = Buffer.concat([
      index_byte,
      context_bytes,
      secret_commitment_bytes,
      nonce_commitment_bytes,
    ]);

    const challenge_hash = sha256(challenge_input).digest();
    const challenge_hash_int = BigInt(`0x${challenge_hash.toString("hex")}`);

    const expected_nonce_commitment = G.multiply(s).add(
      secret_commitment.multiply(Q - challenge_hash_int),
    );
    return nonce_commitment.equals(expected_nonce_commitment);
  }

  generate_shares(): void {
    if (!this.coefficients) {
      throw new Error(
        "Polynomial coefficients must be initialized before generating shares.",
      );
    }

    this.shares = Array.from({ length: this.participants }, (_, i) =>
      this._evaluate_polynomial(BigInt(i + 1)),
    );
  }

  generate_repair_shares(repair_participants: number[], index: number): void {
    if (this.aggregate_share === null) {
      throw new Error("Aggregate share has not been initialized.");
    }

    const lagrange_coefficient = this._lagrange_coefficient(
      repair_participants,
      0n,
      BigInt(index),
    );
    const random_shares = Array.from({ length: this.threshold - 1 }, () =>
      BigInt(Math.floor(Math.random() * Number(Q))),
    );
    const final_share =
      (lagrange_coefficient * this.aggregate_share -
        random_shares.reduce((a, b) => a + b, 0n)) %
      Q;

    this.repair_shares = [...random_shares, final_share];
    this.repair_share_commitments = this.repair_shares.map((share) =>
      share !== null ? G.multiply(share) : null,
    );
    this.repair_participants = [...repair_participants, this.index].sort(
      (a, b) => a - b,
    );
  }

  get_repair_share(participant_index: number): bigint | null {
    if (!this.repair_participants || !this.repair_shares) {
      throw new Error("Repair shares have not been initialized.");
    }
    if (!this.repair_participants.includes(participant_index)) {
      throw new Error("Participant index does not match the initial set.");
    }

    const mapped_index = this.repair_participants.indexOf(participant_index);
    return this.repair_shares[mapped_index];
  }

  get_repair_share_commitment(
    participant_index: number,
    repair_share_commitments: Point[],
    repair_participants?: number[],
  ): Point | null {
    if (!repair_participants) {
      if (!this.repair_participants) {
        throw new Error("Repair participants must be initialized or provided.");
      }
      repair_participants = this.repair_participants;
    }
    if (!repair_participants.includes(participant_index)) {
      throw new Error("Participant index does not match the initial set.");
    }

    const mapped_index = repair_participants.indexOf(participant_index);
    return repair_share_commitments[mapped_index];
  }

  verify_aggregate_repair_share(
    aggregate_repair_share: bigint,
    repair_share_commitments: Point[][],
    aggregator_index: number,
    repair_participants: number[],
    group_commitments: Point[],
  ): boolean {
    if (repair_share_commitments.length !== this.threshold) {
      throw new Error(
        "The number of repair share commitments must match the threshold.",
      );
    }

    for (let i = 0; i < repair_participants.length; i++) {
      const dealer_index = repair_participants[i];
      const commitments = repair_share_commitments[i];
      const lagrange_coefficient = this._lagrange_coefficient(
        repair_participants,
        BigInt(this.index),
        BigInt(dealer_index),
      );
      const dealer_public_share = this.derive_public_verification_share(
        group_commitments,
        dealer_index,
        this.threshold,
      );
      if (
        !dealer_public_share
          .multiply(lagrange_coefficient)
          .equals(
            commitments.reduce(
              (sum, commitment) => sum.add(commitment),
              new Point(),
            ),
          )
      ) {
        return false;
      }
    }

    const aggregate_repair_share_commitment = repair_share_commitments.reduce(
      (sum, commitments) =>
        sum.add(
          this.get_repair_share_commitment(
            aggregator_index,
            commitments,
            repair_participants,
          ) || new Point(),
        ),
      new Point(),
    );

    return G.multiply(aggregate_repair_share).equals(
      aggregate_repair_share_commitment,
    );
  }

  verify_repair_share(
    repair_share: bigint,
    repair_share_commitments: Point[],
    repair_index: number,
    dealer_index: number,
  ): boolean {
    if (!this.group_commitments) {
      throw new Error("Group commitments must be initialized.");
    }
    if (!this.repair_participants) {
      throw new Error("Repair participants must be initialized.");
    }
    if (
      !G.multiply(repair_share).equals(
        this.get_repair_share_commitment(
          this.index,
          repair_share_commitments,
        ) || new Point(),
      )
    ) {
      return false;
    }
    if (repair_share_commitments.length !== this.threshold) {
      throw new Error(
        "The number of repair share commitments must match the threshold.",
      );
    }

    const lagrange_coefficient = this._lagrange_coefficient(
      this.repair_participants,
      BigInt(repair_index),
      BigInt(dealer_index),
    );
    const dealer_public_share = this.derive_public_verification_share(
      this.group_commitments,
      dealer_index,
      this.threshold,
    );
    return dealer_public_share
      .multiply(lagrange_coefficient)
      .equals(
        repair_share_commitments.reduce(
          (sum, commitment) => sum.add(commitment),
          new Point(),
        ),
      );
  }

  private _evaluate_polynomial(x: bigint): bigint {
    if (!this.coefficients) {
      throw new Error("Polynomial coefficients must be initialized.");
    }

    let y = 0n;
    for (let i = this.coefficients.length - 1; i >= 0; i--) {
      y = (y * x + this.coefficients[i]) % Q;
    }
    return y;
  }

  private _lagrange_coefficient(
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
    return (numerator * Participant.modInverse(denominator, Q)) % Q;
  }

  verify_share(
    share: bigint,
    coefficient_commitments: Point[],
    threshold: number,
  ): boolean {
    if (coefficient_commitments.length !== threshold) {
      throw new Error(
        "The number of coefficient commitments must match the threshold.",
      );
    }

    const expected_share = this.derive_public_verification_share(
      coefficient_commitments,
      this.index,
      threshold,
    );
    return G.multiply(share).equals(expected_share);
  }

  aggregate_shares(other_shares: bigint[]): void {
    if (!this.shares) {
      throw new Error("Participant's shares have not been initialized.");
    }
    if (this.index - 1 < 0 || this.index - 1 >= this.shares.length) {
      throw new Error("Participant index is out of range.");
    }
    if (other_shares.length !== this.participants - 1) {
      throw new Error(
        `Expected exactly ${this.participants - 1} other shares, received ${other_shares.length}.`,
      );
    }

    let aggregate_share = this.shares[this.index - 1];
    for (const other_share of other_shares) {
      aggregate_share = (aggregate_share + other_share) % Q;
    }

    if (this.aggregate_share !== null) {
      this.aggregate_share = (this.aggregate_share + aggregate_share) % Q;
    } else {
      this.aggregate_share = aggregate_share;
    }
  }

  aggregate_repair_shares(other_shares: bigint[]): void {
    if (!this.repair_shares) {
      throw new Error("Participant's repair shares have not been initialized.");
    }
    if (other_shares.length !== this.threshold - 1) {
      throw new Error(
        `Expected exactly ${this.threshold - 1} other shares, received ${other_shares.length}.`,
      );
    }

    let aggregate_repair_share = this.get_repair_share(this.index);
    if (aggregate_repair_share === null) {
      throw new Error("Repair share for this participant is null.");
    }

    for (const other_share of other_shares) {
      aggregate_repair_share = (aggregate_repair_share + other_share) % Q;
    }

    this.aggregate_repair_share = aggregate_repair_share;
  }

  repair_share(aggregate_repair_shares: bigint[]): void {
    if (this.aggregate_share !== null) {
      throw new Error("Participant's share has not been lost");
    }
    if (aggregate_repair_shares.length !== this.threshold) {
      throw new Error(
        `Expected exactly ${this.threshold} aggregate repair shares, received ${aggregate_repair_shares.length}.`,
      );
    }

    this.aggregate_share = aggregate_repair_shares.reduce(
      (a, b) => (a + b) % Q,
      0n,
    );
  }

  // ... (continuing from the previous TypeScript implementation)

  decrement_threshold(
    revealed_share: bigint,
    revealed_share_index: number,
  ): void {
    if (this.aggregate_share === null) {
      throw new Error("Participant's share has not been initialized.");
    }
    if (this.group_commitments === null) {
      throw new Error("Group commitments have not been initialized.");
    }

    const numerator = this.aggregate_share - revealed_share;
    const denominator = BigInt(this.index - revealed_share_index);
    const quotient = (numerator * Participant.modInverse(denominator, Q)) % Q;
    this.aggregate_share =
      (revealed_share - BigInt(revealed_share_index) * quotient) % Q;

    this.threshold -= 1;
    const public_verification_shares: Point[] = [];
    const indexes: number[] = [];
    const F_j = G.multiply(revealed_share);
    for (let index = 1; index <= this.threshold; index++) {
      const F_i = this.derive_public_verification_share(
        this.group_commitments,
        index,
        this.threshold + 1,
      );
      const inverse_i_j = Participant.modInverse(
        BigInt(index - revealed_share_index),
        Q,
      );
      const Fp_i = F_j.subtract(
        F_i.subtract(F_j).multiply(BigInt(revealed_share_index) * inverse_i_j),
      );
      public_verification_shares.push(Fp_i);
      indexes.push(index);
    }
    const group_commitments = this.derive_coefficient_commitments(
      public_verification_shares,
      indexes,
    );
    this.group_commitments = group_commitments;
  }

  increase_threshold(other_shares: bigint[]): void {
    if (!this.shares) {
      throw new Error("Participant's shares have not been initialized.");
    }
    if (!this.aggregate_share) {
      throw new Error(
        "Participant's aggregate share has not been initialized.",
      );
    }

    const aggregate_share =
      (this.shares[this.index - 1] + other_shares.reduce((a, b) => a + b, 0n)) %
      Q;
    this.aggregate_share =
      (this.aggregate_share + aggregate_share * BigInt(this.index)) % Q;
  }

  public_verification_share(): Point {
    if (this.aggregate_share === null) {
      throw new Error("Aggregate share has not been initialized.");
    }

    return G.multiply(this.aggregate_share);
  }

  derive_public_verification_share(
    coefficient_commitments: Point[],
    index: number,
    threshold: number,
  ): Point {
    if (coefficient_commitments.length !== threshold) {
      throw new Error(
        "The number of coefficient commitments must match the threshold.",
      );
    }

    let expected_y_commitment = new Point(); // Point at infinity
    for (let k = 0; k < coefficient_commitments.length; k++) {
      expected_y_commitment = expected_y_commitment.add(
        coefficient_commitments[k].multiply(BigInt(index) ** BigInt(k) % Q),
      );
    }

    return expected_y_commitment;
  }

  derive_public_key(other_secret_commitments: Point[]): Point {
    if (!this.coefficient_commitments) {
      throw new Error(
        "Coefficient commitments have not been initialized or are empty.",
      );
    }

    let public_key = this.coefficient_commitments[0];
    for (const other_secret_commitment of other_secret_commitments) {
      if (!(other_secret_commitment instanceof Point)) {
        throw new Error("All secret commitments must be Point instances.");
      }
      public_key = public_key.add(other_secret_commitment);
    }

    this.public_key = public_key;
    return public_key;
  }

  derive_group_commitments(other_coefficient_commitments: Point[][]): void {
    if (!this.coefficient_commitments) {
      throw new Error(
        "Coefficient commitments have not been initialized or are empty.",
      );
    }

    const group_commitments = other_coefficient_commitments[0].map((_, i) =>
      other_coefficient_commitments
        .reduce((sum, commitments) => sum.add(commitments[i]), new Point())
        .add(this.coefficient_commitments![i]),
    );

    if (this.group_commitments !== null) {
      this.group_commitments = this.group_commitments.map((commitment, i) =>
        commitment.add(group_commitments[i]),
      );
    } else {
      this.group_commitments = group_commitments;
    }
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
    if (this.aggregate_share === null) {
      throw new Error("Aggregate share has not been initialized.");
    }

    const group_commitment = Aggregator.group_commitment(
      message,
      nonce_commitment_pairs,
      participant_indexes,
    );
    if (!group_commitment.x || !group_commitment.y) {
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

    if (group_commitment.y % 2n !== 0n) {
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
    let aggregate_share = this.aggregate_share;

    if (public_key.y === null) {
      throw new Error("Public key is the point at infinity.");
    }
    if (public_key.y % 2n !== BigInt(parity)) {
      aggregate_share = Q - aggregate_share;
    }

    return (
      (first_nonce +
        second_nonce * binding_value +
        lagrange_coefficient * aggregate_share * challenge_hash) %
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

  private static modInverse(a: bigint, m: bigint): bigint {
    let [old_r, r] = [a, m];
    let [old_s, s] = [1n, 0n];
    let [old_t, t] = [0n, 1n];

    while (r !== 0n) {
      const quotient = old_r / r;
      [old_r, r] = [r, old_r - quotient * r];
      [old_s, s] = [s, old_s - quotient * s];
      [old_t, t] = [t, old_t - quotient * t];
    }

    if (old_r > 1n) {
      throw new Error("Modular inverse does not exist");
    }

    if (old_s < 0n) {
      old_s += m;
    }

    return old_s;
  }
}
