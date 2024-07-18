import { P, Q, G_x, G_y } from "./constants";

function mod(a: bigint, b: bigint): bigint {
  return ((a % b) + b) % b;
}
export class Point {
  x: bigint | null;
  y: bigint | null;

  constructor(x: bigint | null = null, y: bigint | null = null) {
    this.x = x;
    this.y = y;
  }

  isInfinity(): boolean {
    return this.x === null || this.y === null;
  }
  normalize(): Point {
    if (this.isInfinity()) {
      return new Point(null, null);
    }
    if (this.y! > P - this.y!) {
      console.log("Normalized to diff", (P - this.y!) % P);
      return new Point(this.x, (P - this.y!) % P);
    }
    console.log("Normalized to same");
    return new Point(this.x, this.y);
  }

  static sec_deserialize(hex_public_key: string): Point {
    try {
      const hex_bytes = Buffer.from(hex_public_key, "hex");
      if (hex_bytes.length !== 33) {
        throw new Error(
          "Input must be exactly 33 bytes long for SEC 1 compressed format.",
        );
      }
      const is_even = hex_bytes[0] === 0x02;
      const x_bytes = hex_bytes.slice(1);
      const x = BigInt(`0x${x_bytes.toString("hex")}`);
      const y_squared = (x ** 3n + 7n) % P;
      let y = this.modPow(y_squared, (P + 1n) / 4n, P);

      if (y % 2n === 0n) {
        y = is_even ? y : (P - y) % P;
      } else {
        y = is_even ? (P - y) % P : y;
      }

      return new Point(x, y);
    } catch (e) {
      throw new Error(
        "Invalid hex input or unable to compute point from x-coordinate.",
      );
    }
  }

  sec_serialize(): Buffer {
    if (this.x === null || this.y === null) {
      throw new Error("Cannot serialize the point at infinity.");
    }

    const prefix =
      this.y % 2n === 0n ? Buffer.from([0x02]) : Buffer.from([0x03]);

    const xBytes = Buffer.alloc(32);
    let x = this.x;
    for (let i = 31; i >= 0; i--) {
      xBytes[i] = Number(x & 0xffn);
      x >>= 8n;
    }

    return Buffer.concat([prefix, xBytes]);
  }
  private static modularSquareRoot(a: bigint, p: bigint): bigint | null {
    if (p % 4n === 3n) {
      const r = this.modPow(a, (p + 1n) / 4n, p);
      if ((r * r) % p === a) return r;
      return null;
    }
    // For p % 4 === 1, implement Tonelli-Shanks algorithm
    throw new Error(
      "Modular square root algorithm not implemented for this prime",
    );
  }

  static xonly_deserialize(hex_public_key: Buffer): Point {
    if (hex_public_key.length !== 32) {
      throw new Error(
        `Invalid hex length: expected 64, got ${hex_public_key.length}`,
      );
    }
    try {
      const x = BigInt(`0x${hex_public_key.toString("hex")}`);
      console.log("Parsed x-coordinate:", x.toString());

      // y^2 = x^3 + 7 (secp256k1 curve equation)
      const y_squared = (x * x * x + 7n) % P;
      console.log("Calculated y^2:", y_squared.toString());

      // Calculate y
      let y = this.modularSquareRoot(y_squared, P);
      console.log("Calculated y:", y!.toString());

      if (y === null) {
        throw new Error("Unable to compute valid y-coordinate");
      }
      if (y % 2n !== 0n) {
        y = (P - y) % P;
      }
      return new Point(x, y);
      // return new Point(x, y).normalize();
    } catch (error) {
      console.error("Error in xonly_deserialize:", error);
      throw new Error(
        "Invalid hex input or unable to compute point from x-coordinate",
      );
    }
  }

  xonly_serialize(): Buffer {
    if (this.x === null || this.y === null) {
      throw new Error("Cannot serialize point at infinity");
    }
    const buffer = Buffer.alloc(32);
    const xHex = this.x.toString(16).padStart(64, "0");
    buffer.write(xHex, 0, "hex");
    return buffer;
  }

  is_zero(): boolean {
    return this.x === null || this.y === null;
  }

  equals(other: Point): boolean {
    if (!(other instanceof Point)) {
      return false;
    }
    return this.x === other.x && this.y === other.y;
  }

  negate(): Point {
    if (this.x === null || this.y === null) {
      return this;
    }
    return new Point(this.x, P - this.y);
  }

  private _dbl(): Point {
    if (this.x === null || this.y === null || this.y === 0n) {
      return new Point();
    }

    const x = this.x;
    const y = this.y;
    const s = (3n * x * x * Point.modInverse(2n * y, P)) % P;
    const sum_x = (s * s - 2n * x) % P;
    const sum_y = (s * (x - sum_x) - y) % P;

    return new Point(sum_x, sum_y);
  }

  subtract(other: Point): Point {
    return this.add(other.negate());
  }
  add(other: Point): Point {
    if (!(other instanceof Point)) {
      throw new Error("The other object must be an instance of Point");
    }

    if (this.equals(other)) {
      return this.double();
    }

    if (this.isInfinity()) {
      return new Point(other.x, other.y);
    }

    if (other.isInfinity()) {
      return new Point(this.x, this.y);
    }

    if (this.x === other.x && this.y !== other.y) {
      return new Point(null, null); // Point at infinity
    }

    const s = mod(
      (other.y! - this.y!) * this.modInverse(other.x! - this.x!, P),
      P,
    );
    const sum_x = mod(s * s - this.x! - other.x!, P);
    const sum_y = mod(s * (this.x! - sum_x) - this.y!, P);

    return new Point(sum_x, sum_y);
  }

  double(): Point {
    if (this.isInfinity() || this.y === 0n) {
      return new Point(null, null);
    }

    const x = this.x!;
    const y = this.y!;

    const s = mod(3n * x * x * this.modInverse(2n * y, P), P);
    const sum_x = mod(s * s - 2n * x, P);
    const sum_y = mod(s * (x - sum_x) - y, P);

    return new Point(sum_x, sum_y);
  }

  multiply(scalar: bigint): Point {
    // Reduce scalar by the group order to ensure operation within the finite group
    scalar = mod(scalar, Q);

    if (typeof scalar !== "bigint") {
      throw new Error("The scalar must be a bigint");
    }

    let p: Point = new Point(this.x, this.y);
    let r: Point = new Point(null, null); // Point at infinity
    let i: bigint = 1n;

    while (i <= scalar) {
      if (i & scalar) {
        r = r.add(p);
      }
      p = p.double();
      i <<= 1n;
    }

    return r;
  }

  toString(): string {
    if (this.is_zero()) {
      return "0";
    }
    return `X: 0x${this.x!.toString(16)}\nY: 0x${this.y!.toString(16)}`;
  }

  modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
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

  static modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
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

  private calculateSlope(other: Point): bigint {
    const dx = (other.x! - this.x! + P) % P;
    const dy = (other.y! - this.y! + P) % P;
    return (dy * this.modInverse(dx, P)) % P;
  }

  private calculateTangentSlope(): bigint {
    const numerator = (3n * this.x! * this.x!) % P;
    const denominator = (2n * this.y!) % P;
    return (numerator * this.modInverse(denominator, P)) % P;
  }

  private modInverse(a: bigint, m: bigint): bigint {
    let [old_r, r] = [mod(a, m), m];
    let [old_s, s] = [1n, 0n];

    while (r !== 0n) {
      const quotient = old_r / r;
      [old_r, r] = [r, old_r - quotient * r];
      [old_s, s] = [s, old_s - quotient * s];
    }

    if (old_r > 1n) {
      throw new Error("Modular inverse does not exist");
    }

    return mod(old_s, m);
  }
  static modInverse(a: bigint, m: bigint): bigint {
    let [old_r, r] = [mod(a, m), m];
    let [old_s, s] = [1n, 0n];

    while (r !== 0n) {
      const quotient = old_r / r;
      [old_r, r] = [r, old_r - quotient * r];
      [old_s, s] = [s, old_s - quotient * s];
    }

    if (old_r > 1n) {
      throw new Error("Modular inverse does not exist");
    }

    return mod(old_s, m);
  }
}

export const G: Point = new Point(G_x, G_y);
